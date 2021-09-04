import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, FlagRegister, isGeneralRegister, getGrOrThrow } from "./registerAccessor"

const numFmt = /[0-9]+/
function isNumeric(s: string): boolean {
  return numFmt.test(s)
}

export function makeADDA(
  tokens: Tokens,
  labels: Map<string, Label>,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
  memory: Memory
): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]
  const grx = ts.length > 2 ? ts[2] : null

  if (isGeneralRegister(target)) {
    // GR1+GR2 -> GR1
    const operand1GR = getGrOrThrow(operand1, grMap)
    const operand2GR = getGrOrThrow(target, grMap)
    return {
      tokens,
      proc: () => {
        operand1GR.store(operand1GR.lookup() + operand2GR.lookup())
      }
    }
  } else {
    // GR1+10 -> GR1
    const operand1GR = getGrOrThrow(operand1, grMap)
    let address = 0
    if (isNumeric(target)) {
      address = Number(target)
    } else {
      address = getLabelOrThrow(target, labels).memAddress
    }
    if (grx != null) {
      const indexGR = getGrOrThrow(grx, grMap)
      address = address + indexGR.lookup()
    }
    return {
      tokens,
      proc: () => {
        operand1GR.store(operand1GR.lookup() + memory.lookup(address))
      }
    }
  }
}

