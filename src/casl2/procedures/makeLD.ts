import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { Register, isGeneralRegister, getGrOrThrow } from "./registerAccessor"

export function makeLD(
  tokens: Tokens,
  labels: Map<string, Label>,
  grMap: Map<string, Register>,
  memory: Memory
): Instruction {
  const ts = tokens.operand.split(",")
  const target = ts[0]
  const value = ts[1]
  const distGR = getGrOrThrow(target, grMap)
  const grx = ts.length > 2 ? ts[2] : null
  if (isGeneralRegister(value)) {
    // GR -> GR
    const srcGR = getGrOrThrow(value, grMap)
    if (grx != null) {
      throw new Error(`cannot use GRx: ${tokens}`)
    }
    return {
      tokens,
      proc: () => {
        distGR.store(srcGR.lookup())
      }
    }
  } else {
    // memory -> GR
    let address = 0
    const r = /#?[0-9]+/
    if (r.test(value)) {
      address = Number(value.replace("#", ""))
    } else {
      const label = getLabelOrThrow(value, labels)
      address = label.memAddress
    }
    if (grx != null) {
      const indexGR = getGrOrThrow(grx, grMap)
      address = address + indexGR.lookup()
    }
    return {
      tokens,
      proc: () => {
        distGR.store(memory.lookup(address))
      }
    }
  }
}
