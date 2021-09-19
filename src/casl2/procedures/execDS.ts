import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"

const numFmt = /[0-9]+/
function isNumeric(s: string): boolean {
  return numFmt.test(s)
}

export function execDS(
  tokens: Tokens,
  labels: Map<string, Label>,
  memory: Memory
): Instruction {
  const operand = tokens.operand
  const labelText = tokens.label
  if (!isNumeric(operand)) {
      throw new Error(`operand should be number: ${tokens}`)
  }
  const reservedSpace = Number(operand)
  return {
    wordLength: reservedSpace,
    tokens,
    gen: (currentMemAddress) => {
      const address =
        labelText == "" ? currentMemAddress : getLabelOrThrow(labelText, labels).memAddress
      if (address == null) {
        throw Error(`address is null.`)
      }
      return {
        bytecode: new ArrayBuffer(0),
        proc: () => {
          // NOP
        }
      }
    }
  }
}
