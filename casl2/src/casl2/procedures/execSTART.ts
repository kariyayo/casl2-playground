import { Instruction, Label, Tokens } from "../types"

export function execSTART(
  tokens: Tokens,
  labels: Map<string, Label>,
): Instruction {
  return {
    wordLength: 0,
    tokens,
    gen: () => null
  }
}
