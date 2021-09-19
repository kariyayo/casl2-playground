import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"

export function makeRET(
  tokens: Tokens,
  labels: Map<string, Label>,
  memory: Memory
): Instruction {
  const opCode = 0x81
  return {
    wordLength: 1,
    tokens,
    gen: () => {
      const bytecode = new ArrayBuffer(2)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, 0)
      return {
        bytecode,
        proc: () => {
          // TODO
        }
      }
    }
  }
}
