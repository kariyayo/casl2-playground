import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, FlagRegister, isGeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"
import { isNumeric } from "./strings"

export function makeCPA(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]
  if (isGeneralRegister(target)) {
    // GR1 > GR2 -> FR
    const opCode = 0x44
    const wordLength = 1
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
        const operand1GR = getGrOrThrow(operand1, grMap)
        const operand2GR = getGrOrThrow(target, grMap)
        const bytecode = new ArrayBuffer(2)
        const byteArray = new Uint8Array(bytecode, 0, 2)
        byteArray[0] = opCode
        byteArray[1] = (grToBytecode(operand1GR) << 4) + grToBytecode(operand2GR)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            const v = operand1GR.lookup() - operand2GR.lookup()
            flagRegister.setByCPA(v)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  } else {
    // GR1 > memory(10) -> FR
    const opCode = 0x40
    const wordLength = 2
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
        const grx = ts.length > 2 ? ts[2] : null
        const operand1GR = getGrOrThrow(operand1, grMap)
        const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
        let operandAddress = 0
        if (isNumeric(target)) {
          operandAddress = Number(target)
        } else {
          operandAddress = getLabelOrThrow(target, labels).memAddress
        }
        const bytecode = new ArrayBuffer(4)
        const view = new DataView(bytecode)
        view.setUint8(0, opCode)
        view.setUint8(1, (grToBytecode(operand1GR) << 4) + grToBytecode(indexGR))
        view.setUint16(2, operandAddress, false)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            let address = operandAddress
            if (indexGR != null) {
              address = address + indexGR.lookup()
            }
            const v = operand1GR.lookup() - memory.lookup(address)
            flagRegister.setByCPA(v)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  }
}
