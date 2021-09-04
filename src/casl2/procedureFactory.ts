import { Register } from "../infra/register"
import { Memory } from "../infra/memory"
import { Instruction, Label, Tokens } from "./types"
import { makeLD } from "./procedures/makeLD"

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
