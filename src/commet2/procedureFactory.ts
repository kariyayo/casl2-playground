import { Memory } from "./memory"
import { isGeneralRegister, Register } from "./register"
import { Tokens } from "./tokenizer"

export type Instruction = {
  tokens: Tokens
  proc: () => void
}

export function makeProcedure(
  tokens: Tokens,
  labels: Map<string, Label>,
  grMap: Map<string, Register>,
  memory: Memory
): Instruction | null {
  switch (tokens.operator) {
    case "START":
      break
    case "END":
      break
    case "IN":
      break
    case "OUT":
      break
    case "RPUSH":
      break
    case "RPOP":
      break
    case "LD":
      return makeLD(tokens, labels, grMap, memory)
    case "ST":
      break
    case "LAD":
      break
    case "ADDA":
      break
    case "SUBA":
      break
    case "ADDL":
      break
    case "SUBL":
      break
    default:
      throw Error("")
  }
  return null
}

export type Label = {
  label: string
  memAddress: number
}

function getLabelOrThrow(text: string, labels: Map<string, Label>): Label {
  const label = labels.get(text)
  if (label == null) {
    throw new Error(`not found label: ${text}`)
  }
  return label
}

function getGrOrThrow(text: string, grMap: Map<string, Register>): Register {
  const gr = grMap.get(text)
  if (gr == null) {
    throw new Error(`not found Register: ${text}`)
  }
  return gr
}

function makeLD(
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
