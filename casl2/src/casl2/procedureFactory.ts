import { FlagRegister, GeneralRegister } from "../infra/register"
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
import { makeST } from "./procedures/makeST"
import { makeOR } from "./procedures/makeOR"
import { makeAND } from "./procedures/makeAND"
import { makeXOR } from "./procedures/makeXOR"
import { makeSLA } from "./procedures/makeSLA"
import { makeSRA } from "./procedures/makeSRA"
import { makeSLL } from "./procedures/makeSLL"
import { makeSRL } from "./procedures/makeSRL"
import { makeCALL } from "./procedures/makeCALL"

export function makeProcedure(
  tokens: Tokens,
  labels: Map<string, Label>,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
  SP: GeneralRegister,
): Instruction | null {
  switch (tokens.operator) {
    case "START":
      return execSTART(tokens, labels)
    case "END":
      return execEND(tokens, labels)
    case "DC":
      return execDC(tokens, labels)
    case "DS":
      return execDS(tokens, labels)
    case "LD":
      return makeLD(tokens, labels, flagRegister, grMap)
    case "ST":
      return makeST(tokens, labels, grMap)
    case "LAD":
      return makeLAD(tokens, labels, grMap)
    case "ADDA":
      return makeADDA(tokens, labels, flagRegister, grMap)
    case "SUBA":
      return makeSUBA(tokens, labels, flagRegister, grMap)
    case "ADDL":
      return makeADDL(tokens, labels, flagRegister, grMap)
    case "SUBL":
      return makeSUBL(tokens, labels, flagRegister, grMap)
    case "CPA":
      return makeCPA(tokens, labels, flagRegister, grMap)
    case "CPL":
      return makeCPL(tokens, labels, flagRegister, grMap)
    case "JUMP":
      return makeJUMP(tokens, labels, grMap)
    case "JPL":
      return makeJPL(tokens, labels, flagRegister, grMap)
    case "JMI":
      return makeJMI(tokens, labels, flagRegister, grMap)
    case "JZE":
      return makeJZE(tokens, labels, flagRegister, grMap)
    case "JNZ":
      return makeJNZ(tokens, labels, flagRegister, grMap)
    case "JOV":
      return makeJOV(tokens, labels, flagRegister, grMap)
    case "OR":
      return makeOR(tokens, labels, flagRegister, grMap)
    case "AND":
      return makeAND(tokens, labels, flagRegister, grMap)
    case "XOR":
      return makeXOR(tokens, labels, flagRegister, grMap)
    case "SLL":
      return makeSLL(tokens, labels, flagRegister, grMap)
    case "SRL":
      return makeSRL(tokens, labels, flagRegister, grMap)
    case "SLA":
      return makeSLA(tokens, labels, flagRegister, grMap)
    case "SRA":
      return makeSRA(tokens, labels, flagRegister, grMap)
    case "PUSH":
      return makePUSH(tokens, grMap, SP)
    case "POP":
      return makePOP(tokens, grMap, SP)
    case "CALL":
      return makeCALL(tokens, labels, grMap, SP)
    case "RET":
      return makeRET(tokens, SP)
    default:
      throw Error(`${tokens.operator} is unknown`)
  }
  return null
}
