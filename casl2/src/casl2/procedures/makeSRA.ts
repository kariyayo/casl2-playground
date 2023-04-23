import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, FlagRegister, isGeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"
import { isNumeric } from "./strings"

export function makeSRA(
  tokens: Tokens,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]
  const grx = ts.length > 2 ? ts[2] : null

  // GR1 >> 2 -> GR1
  const opCode = 0x51
  const wordLength = 2
  const operand1GR = getGrOrThrow(operand1, grMap)
  const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
  return {
    wordLength,
    tokens,
    gen: (
      memory: Memory,
      labels: Map<string, Label>,
      currentMemAddress?: number
    ) => {
      // e.g. SRA GR1,adr
      let operandAddress = 0
      if (isNumeric(target)) {
        operandAddress = Number(target)
      } else {
        operandAddress = getLabelOrThrow(target, labels).memAddress
      }
      const bytecode = new ArrayBuffer(4)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, (grToBytecode(operand1GR) << 4) + grToBytecode(indexGR))
      view.setUint16(2, operandAddress, false)
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          let b = operandAddress
          if (indexGR != null) {
            b = b + indexGR.lookup()
          }
          const v = operand1GR.lookup() >> b
          let overflowFlag = false
          if (((operand1GR.lookupLogical() >> (b - 1)) & 1) !== 0) {
            overflowFlag = true
          }
          operand1GR.store(v)
          flagRegister.setWithOverflowFlag(v, overflowFlag)
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
