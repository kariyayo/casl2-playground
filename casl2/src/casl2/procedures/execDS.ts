import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister } from "./registerAccessor"
import { isDigits } from "./strings"

export function execDS(tokens: Tokens): Instruction {
  const operand = tokens.operand
  const labelText = tokens.label
  if (!isDigits(operand)) {
      throw new Error(`operand should be positive number: ${tokens}`)
  }
  const reservedSpace = Number(operand)
  const wordLength = reservedSpace
  return {
    wordLength,
    tokens,
    gen: (
      grMap: Map<string, GeneralRegister>,
      memory: Memory,
      labels: Map<string, Label>,
      currentMemAddress?: number
    ) => {
      const address =
        labelText == "" ? currentMemAddress : getLabelOrThrow(labelText, labels).memAddress
      if (address == null) {
        throw Error(`address is null.`)
      }
      return { bytecode: new ArrayBuffer(2*wordLength) }
    }
  }
}
