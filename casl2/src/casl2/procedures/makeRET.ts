import { Memory } from "../../infra/memory"
import { Instruction, Tokens } from "../types"
import { GeneralRegister, END_ADDRESS } from "./registerAccessor"

export function makeRET(
  tokens: Tokens,
  SP: GeneralRegister,
): Instruction {
  const opCode = 0x81
  return {
    wordLength: 1,
    tokens,
    gen: (memory: Memory) => {
      const bytecode = new ArrayBuffer(2)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, 0)
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          const sp = SP.lookupLogical()
          if (sp != END_ADDRESS) {
            const address = memory.lookupLogical(sp)
            PR.storeLogical(address)
            SP.storeLogical(sp+1)
          } else {
            PR.store(-32678)
          }
        }
      }
    }
  }
}
