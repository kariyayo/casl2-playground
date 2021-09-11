import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"

export function execDC(
  tokens: Tokens,
  labels: Map<string, Label>,
  memory: Memory,
  currentMemAddress: number,
): Instruction {
  const operand = tokens.operand
  const labelText = tokens.label
  const address =
    labelText == "" ? currentMemAddress : getLabelOrThrow(labelText, labels).memAddress

  // load constant value in memory
  memory.store(address, operand)

  return {
    wordLength: 1,
    tokens,
    gen: () => {
      return {
        bytecode: new ArrayBuffer(0),
        proc: () => {
          // NOP
        }
      }
    }
  }
}
