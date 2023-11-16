import { Instruction, Label, Tokens } from "../../types"
import { isDigits } from "./strings"

export function execDS(tokens: Tokens): Instruction {
  const operand = tokens.operand
  if (!isDigits(operand)) {
      throw new Error(`operand should be positive number: ${tokens}`)
  }
  const reservedSpace = Number(operand)
  const wordLength = reservedSpace
  return {
    wordLength,
    tokens,
    gen: (
      labels: Map<string, Label>,
    ) => {
      const bf = new ArrayBuffer(2*wordLength)
      const view = new Uint16Array(bf)
      view.fill(0x7FFF)
      return { bytecode: bf }
    }
  }
}
