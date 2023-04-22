import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { advancePR, GeneralRegister } from "./registerAccessor"
import { isDigits } from "./strings"

export function execDS(
  tokens: Tokens,
  labels: Map<string, Label>,
): Instruction {
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
    gen: (memory: Memory, currentMemAddress) => {
      const address =
        labelText == "" ? currentMemAddress : getLabelOrThrow(labelText, labels).memAddress
      if (address == null) {
        throw Error(`address is null.`)
      }
      return {
        bytecode: new ArrayBuffer(0),
        proc: (PR: GeneralRegister) => {
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
