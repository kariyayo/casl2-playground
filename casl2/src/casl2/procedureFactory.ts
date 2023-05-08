import { Instruction, Tokens } from "./types"
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

export function makeProcedure(tokens: Tokens): Instruction {
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
      return makeLD(tokens)
    case "ST":
      return makeST(tokens)
    case "LAD":
      return makeLAD(tokens)
    case "ADDA":
      return makeADDA(tokens)
    case "SUBA":
      return makeSUBA(tokens)
    case "ADDL":
      return makeADDL(tokens)
    case "SUBL":
      return makeSUBL(tokens)
    case "CPA":
      return makeCPA(tokens)
    case "CPL":
      return makeCPL(tokens)
    case "JUMP":
      return makeJUMP(tokens)
    case "JPL":
      return makeJPL(tokens)
    case "JMI":
      return makeJMI(tokens)
    case "JZE":
      return makeJZE(tokens)
    case "JNZ":
      return makeJNZ(tokens)
    case "JOV":
      return makeJOV(tokens)
    case "OR":
      return makeOR(tokens)
    case "AND":
      return makeAND(tokens)
    case "XOR":
      return makeXOR(tokens)
    case "SLL":
      return makeSLL(tokens)
    case "SRL":
      return makeSRL(tokens)
    case "SLA":
      return makeSLA(tokens)
    case "SRA":
      return makeSRA(tokens)
    case "PUSH":
      return makePUSH(tokens)
    case "POP":
      return makePOP(tokens)
    case "CALL":
      return makeCALL(tokens)
    case "RET":
      return makeRET(tokens)
    default:
      throw Error(`${tokens.operator} is unknown`)
  }
}
