import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, FlagRegister, isGeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"
import { isNumeric } from "./strings"

export function makeSRA(
  tokens: Tokens,
  labels: Map<string, Label>,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
  memory: Memory
): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]
  const grx = ts.length > 2 ? ts[2] : null

  // GR1 >> 2 -> GR1
  const opCode = 0x51
  const wordLength = 2
  const operand1GR = getGrOrThrow(operand1, grMap)
  let getAddress = () => 0
  if (isNumeric(target)) {
    getAddress = () => Number(target)
  } else {
    getAddress = () => getLabelOrThrow(target, labels).memAddress
  }
  const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
  return {
    wordLength,
    tokens,
    gen: () => {
      // e.g. SRA GR1,adr
      const operandAddress = getAddress()
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
          operand1GR.store(v)
          flagRegister.set(v)
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
