import { Instruction, Tokens } from "../../types"

export function execSTART(tokens: Tokens): Instruction {
  return {
    wordLength: 0,
    tokens,
    gen: () => null
  }
}
