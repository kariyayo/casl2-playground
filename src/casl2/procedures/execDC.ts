import { Memory, START_ADDRESS, WORD_LENGTH } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"

export function execDC(
  tokens: Tokens,
  labels: Map<string, Label>,
  memory: Memory
): Instruction {
  const operand = tokens.operand
  const labelText = tokens.label
  const address =
    labelText == "" ?
      START_ADDRESS + (tokens.instructionNum * WORD_LENGTH)
      : getLabelOrThrow(labelText, labels).memAddress

  // load constant value in memory
  memory.store(address, operand)

  return {
    tokens,
    proc: () => {
      // NOP
    }
  }
}
