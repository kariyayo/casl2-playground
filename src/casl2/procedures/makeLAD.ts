import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { Register, isGeneralRegister, getGrOrThrow } from "./registerAccessor"

const numFmt = /[0-9]+/
function isNumeric(s: string): boolean {
  return numFmt.test(s)
}

export function makeLAD(
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

  let address = 0
  if (isNumeric(value)) {
    address = Number(value)
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
      distGR.store(address)
    }
  }
}
