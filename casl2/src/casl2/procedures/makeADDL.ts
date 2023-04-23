import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, FlagRegister, isGeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"
import { isNumeric } from "./strings"

export function makeADDL(
  tokens: Tokens,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]
  const grx = ts.length > 2 ? ts[2] : null

  if (isGeneralRegister(target)) {
    // GR1+GR2 -> GR1
    const opCode = 0x26
    const wordLength = 1
    const operand1GR = getGrOrThrow(operand1, grMap)
    const operand2GR = getGrOrThrow(target, grMap)
    return {
      wordLength,
      tokens,
      gen: () => {
        // e.g. ADDL GR1,GR2
        const bytecode = new ArrayBuffer(2)
        const byteArray = new Uint8Array(bytecode, 0, 2)
        byteArray[0] = opCode
        byteArray[1] = (grToBytecode(operand1GR) << 4) + grToBytecode(operand2GR)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            const v = operand1GR.lookupLogical() + operand2GR.lookupLogical()
            operand1GR.storeLogical(v)
            flagRegister.setLogical(v)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  } else {
    // GR1+10 -> GR1
    const opCode = 0x22
    const wordLength = 2
    const operand1GR = getGrOrThrow(operand1, grMap)
    const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
    return {
      wordLength,
      tokens,
      gen: (
        memory: Memory,
        labels: Map<string, Label>,
        currentMemAddress?: number
      ) => {
        // e.g. ADD GR1,adr
        let operandAddress =  0
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
            const v = operand1GR.lookupLogical() + memory.lookupLogical(address)
            operand1GR.storeLogical(v)
            flagRegister.setLogical(v)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  }
}
