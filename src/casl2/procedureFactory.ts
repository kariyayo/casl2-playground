import { FlagRegister, GeneralRegister } from "../infra/register"
import { Memory } from "../infra/memory"
import { Instruction, Label, Tokens } from "./types"
import { execDC } from "./procedures/execDC"
import { makeLD } from "./procedures/makeLD"
import { makeLAD } from "./procedures/makeLAD"
import { makeADDA } from "./procedures/makeADDA"
import { execDS } from "./procedures/execDS"
import { execSTART } from "./procedures/execSTART"
import { execEND } from "./procedures/execEND"
import { makeRET } from "./procedures/makeRET"
import { makeSUBA } from "./procedures/makeSUBA"
import { makeJUMP } from "./procedures/makeJUMP"
import { makeJPL } from "./procedures/makeJPL"
import { makeJMI } from "./procedures/makeJMI"
import { makeJZE } from "./procedures/makeJZE"
import { makeJNZ } from "./procedures/makeJNZ"
import { makeJOV } from "./procedures/makeJOV"
import { makeADDL } from "./procedures/makeADDL"
import { makeSUBL } from "./procedures/makeSUBL"
import { makeCPA } from "./procedures/makeCPA"
import { makeCPL } from "./procedures/makeCPL"
import { makePUSH } from "./procedures/makePUSH"
import { tokenize } from "./tokenizer"
import { makePOP } from "./procedures/makePOP"

export function makeProcedure(
  tokens: Tokens,
  labels: Map<string, Label>,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
  memory: Memory,
  SP: GeneralRegister,
): Instruction | null {
  switch (tokens.operator) {
    case "START":
      return execSTART(tokens, labels, memory)
    case "END":
      return execEND(tokens, labels, memory)
    case "DC":
      return execDC(tokens, labels, memory)
    case "DS":
      return execDS(tokens, labels, memory)
    case "LD":
      return makeLD(tokens, labels, flagRegister, grMap, memory)
    case "ST":
      break
    case "LAD":
      return makeLAD(tokens, labels, grMap, memory)
    case "ADDA":
      return makeADDA(tokens, labels, flagRegister, grMap, memory)
    case "SUBA":
      return makeSUBA(tokens, labels, flagRegister, grMap, memory)
    case "ADDL":
      return makeADDL(tokens, labels, flagRegister, grMap, memory)
    case "SUBL":
      return makeSUBL(tokens, labels, flagRegister, grMap, memory)
    case "CPA":
      return makeCPA(tokens, labels, flagRegister, grMap, memory)
    case "CPL":
      return makeCPL(tokens, labels, flagRegister, grMap, memory)
    case "JUMP":
      return makeJUMP(tokens, grMap)
    case "JPL":
      return makeJPL(tokens, flagRegister, grMap)
    case "JMI":
      return makeJMI(tokens, flagRegister, grMap)
    case "JZE":
      return makeJZE(tokens, flagRegister, grMap)
    case "JNZ":
      return makeJNZ(tokens, flagRegister, grMap)
    case "JOV":
      return makeJOV(tokens, flagRegister, grMap)
    case "PUSH":
      return makePUSH(tokens, grMap, memory, SP)
    case "POP":
      return makePOP(tokens, grMap, memory, SP)
    case "RET":
      return makeRET(tokens, memory, SP)
    default:
      throw Error("")
  }
  return null
}
