import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { advancePR, GeneralRegister } from "./registerAccessor"
import { isNumeric } from "./strings"

export function execDC(
  tokens: Tokens,
  labels: Map<string, Label>,
  memory: Memory
): Instruction {
  const operand = tokens.operand
  const labelText = tokens.label
  if (!isNumeric(operand)) {
    throw new Error(`operand should be positive number: ${tokens.operand}`)
  }
  const wordLength = 1
  return {
    wordLength,
    tokens,
    gen: (currentMemAddress) => {
      const address =
        labelText == "" ? currentMemAddress : getLabelOrThrow(labelText, labels).memAddress
      if (address == null) {
        throw Error(`address is null.`)
      }
      // load constant value in memory
      memory.store(address, operand)

      const bytecode = new ArrayBuffer(2)
      const view = new DataView(bytecode)
      view.setInt16(0, Number(operand))
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
