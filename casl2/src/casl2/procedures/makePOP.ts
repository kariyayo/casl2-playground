import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { FlagRegister, GeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"

export function makePOP(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const operand = ts[0]

  const opCode = 0x71
  const wordLength = 1
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
      const targetGR = getGrOrThrow(operand, grMap)
      const bytecode = new ArrayBuffer(4)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, (grToBytecode(targetGR) << 4) + 0)
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          // memory(SP) -> GR
          let address = memory.lookupLogical(SP.lookupLogical())
          targetGR.storeLogical(address)
          SP.storeLogical(SP.lookupLogical()+1)
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
