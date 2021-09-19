import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"

export function execSTART(
  tokens: Tokens,
  labels: Map<string, Label>,
  memory: Memory
): Instruction {
  return {
    wordLength: 0,
    tokens,
    gen: () => {
      return {
        bytecode: new ArrayBuffer(0),
        proc: () => {
          // NOP
        }
      }
    }
  }
}
