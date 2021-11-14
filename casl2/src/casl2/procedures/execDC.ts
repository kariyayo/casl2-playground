import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { advancePR, GeneralRegister } from "./registerAccessor"
import { isHexadecimal, isNumeric } from "./strings"

export function execDC(
  tokens: Tokens,
  labels: Map<string, Label>,
  memory: Memory
): Instruction {
  const operand = tokens.operand
  const labelText = tokens.label
  let operandValue = 0
  if (isNumeric(operand)) {
    operandValue = Number(operand)
  } else if (isHexadecimal(operand)) {
    operandValue = parseInt(operand.replace("#", ""), 16)
  } else {
    throw new Error(`operand should be positive number: ${tokens.operand}`)
  }
  if (operandValue < -32768) {
    throw new Error(`operand should be greater than -32769: ${tokens.operand}`)
  } else if (operandValue > 65535) {
    throw new Error(`operand should be less than 65536: ${tokens.operand}`)
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
      if (operandValue > 32767) {
        memory.storeLogical(address, operandValue)
      } else {
        memory.store(address, operandValue)
      }

      const bytecode = new ArrayBuffer(2)
      const view = new DataView(bytecode)
      view.setInt16(0, operandValue)
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
