import { Instruction, Label, Tokens } from "../types"

export function execEND(tokens: Tokens): Instruction {
  return {
    wordLength: 0,
    tokens,
    gen: () => null
  }
}
