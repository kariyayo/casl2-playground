import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, FlagRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"
import { isNumeric } from "./strings"

export function makeSLL(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]

  // GR1 << 2 -> GR1
  const opCode = 0x52
  const wordLength = 2
  return {
    wordLength,
    tokens,
    gen: (
      grMap: Map<string, GeneralRegister>,
      flagRegister: FlagRegister,
      SP: GeneralRegister,
      memory: Memory,
      labels: Map<string, Label>,
      currentMemAddress?: number
    ) => {
      // e.g. SLL GR1,adr
      const grx = ts.length > 2 ? ts[2] : null
      const operand1GR = getGrOrThrow(operand1, grMap)
      const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
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
          const v = operand1GR.lookupLogical() << b
          let overflowFlag = false
          if (((operand1GR.lookupLogical() >> (16 - b)) & 1) !== 0) {
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
