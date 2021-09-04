import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"

export function makeDC(
  tokens: Tokens,
  labels: Map<string, Label>,
  memory: Memory
): Instruction {
  const operand = tokens.operand
  const labelText = tokens.label
  const label = getLabelOrThrow(labelText, labels)
  return {
    tokens,
    proc: () => {
      memory.store(label.memAddress, operand)
    }
  }
}
