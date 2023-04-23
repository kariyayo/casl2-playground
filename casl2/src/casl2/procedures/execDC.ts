import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { FlagRegister, GeneralRegister, advancePR } from "./registerAccessor"
import { isHexadecimal, isJisX0201, isNumeric } from "./strings"

export function execDC(tokens: Tokens): Instruction {
  const labelText = tokens.label
  const operand = tokens.operand
  let values: Array<number> = []
  if (operand.startsWith("'")) {
    if (!operand.endsWith("'")) {
      throw new Error(`operand starts with "'", but not ends with "'": ${tokens.operand}`)
    }
    const s = operand.substring(1, operand.length - 1)
    if (!isJisX0201(s)) {
      throw new Error(`operand is string, then should be character set of JIS X 0201: ${tokens.operand}`)
    }
    values = s.split("").map(c => c.charCodeAt(0))
  } else {
    values = operand.split(",").map(v => {
      let intVal = 0
      if (isNumeric(v)) {
        intVal = Number(v)
      } else if (isHexadecimal(v)) {
        intVal = parseInt(v.replace("#", ""), 16)
      } else {
        throw new Error(`operand should be positive number: ${tokens.operand}`)
      }
      if (intVal < -32768) {
        throw new Error(`operand should be greater than -32769: ${tokens.operand}`)
      } else if (intVal > 65535) {
        throw new Error(`operand should be less than 65536: ${tokens.operand}`)
      }
      return intVal
    })
  }
  const wordLength = values.length
  return {
    wordLength,
    tokens,
    gen: (
      grMap: Map<string, GeneralRegister>,
      flagRegister: FlagRegister,
      SP: GeneralRegister,
      memory: Memory,
      labels: Map<string, Label>,
      currentMemAddress?: number
    ) => {
      const address =
        labelText == "" ? currentMemAddress : getLabelOrThrow(labelText, labels).memAddress
      if (address == null) {
        throw Error(`address is null.`)
      }
      // load constant value in memory
      const bytecode = new ArrayBuffer(2*values.length)
      const view = new DataView(bytecode)
      values.forEach((v, index) => {
        if (v > 32767) {
          memory.storeLogical(address + index, v)
        } else {
          memory.store(address + index, v)
        }
        view.setInt16(index*2, v)
      })
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
