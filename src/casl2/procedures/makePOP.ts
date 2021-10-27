import { Memory } from "../../infra/memory"
import { Instruction, Tokens } from "../types"
import { GeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"

export function makePOP(
  tokens: Tokens,
  grMap: Map<string, GeneralRegister>,
  memory: Memory,
  SP: GeneralRegister
): Instruction {
  const ts = tokens.operand.split(",")
  const operand = ts[0]

  const opCode = 0x71
  const wordLength = 1
  const targetGR = getGrOrThrow(operand, grMap)
  return {
    wordLength,
    tokens,
    gen: () => {
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
