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
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
  SP: GeneralRegister,
): Instruction | null {
  switch (tokens.operator) {
    case "START":
      return execSTART(tokens)
    case "END":
      return execEND(tokens)
    case "DC":
      return execDC(tokens)
    case "DS":
      return execDS(tokens)
    case "LD":
      return makeLD(tokens, flagRegister, grMap)
    case "ST":
      return makeST(tokens, grMap)
    case "LAD":
      return makeLAD(tokens, grMap)
    case "ADDA":
      return makeADDA(tokens, flagRegister, grMap)
    case "SUBA":
      return makeSUBA(tokens, flagRegister, grMap)
    case "ADDL":
      return makeADDL(tokens, flagRegister, grMap)
    case "SUBL":
      return makeSUBL(tokens, flagRegister, grMap)
    case "CPA":
      return makeCPA(tokens, flagRegister, grMap)
    case "CPL":
      return makeCPL(tokens, flagRegister, grMap)
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
    case "OR":
      return makeOR(tokens, flagRegister, grMap)
    case "AND":
      return makeAND(tokens, flagRegister, grMap)
    case "XOR":
      return makeXOR(tokens, flagRegister, grMap)
    case "SLL":
      return makeSLL(tokens, flagRegister, grMap)
    case "SRL":
      return makeSRL(tokens, flagRegister, grMap)
    case "SLA":
      return makeSLA(tokens, flagRegister, grMap)
    case "SRA":
      return makeSRA(tokens, flagRegister, grMap)
    case "PUSH":
      return makePUSH(tokens, grMap, SP)
    case "POP":
      return makePOP(tokens, grMap, SP)
    case "CALL":
      return makeCALL(tokens, grMap, SP)
    case "RET":
      return makeRET(tokens, SP)
    default:
      throw Error(`${tokens.operator} is unknown`)
  }
  return null
}
