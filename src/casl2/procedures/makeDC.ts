import { Memory, START_ADDRESS, WORD_LENGTH } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"

export function makeDC(
  tokens: Tokens,
  labels: Map<string, Label>,
  memory: Memory
): Instruction {
  const operand = tokens.operand
  const labelText = tokens.label
  let address = 0
  if (labelText == "") {
    address = START_ADDRESS + (tokens.instructionNum * WORD_LENGTH)
    return {
      tokens,
      proc: () => {
        memory.store(address, operand)
      }
    }
  } else {
    const label = getLabelOrThrow(labelText, labels)
    address = label.memAddress
  }
  return {
    tokens,
    proc: () => {
      memory.store(address, operand)
    }
  }
}
