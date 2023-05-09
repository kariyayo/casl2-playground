import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, isGeneralRegister, getGrOrThrow, grToBytecode } from "./registerAccessor"
import { isNumeric } from "./strings"

export function makeADDA(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]
  if (isGeneralRegister(target)) {
    // GR1+GR2 -> GR1
    const opCode = 0x24
    const wordLength = 1
    return {
      wordLength,
      tokens,
      gen: (
        grMap: Map<string, GeneralRegister>,
        labels: Map<string, Label>,
      ) => {
        // e.g. ADDA GR1,GR2
        const operand1GR = getGrOrThrow(operand1, grMap)
        const operand2GR = getGrOrThrow(target, grMap)
        const bytecode = new ArrayBuffer(2)
        const byteArray = new Uint8Array(bytecode, 0, 2)
        byteArray[0] = opCode
        byteArray[1] = (grToBytecode(operand1GR) << 4) + grToBytecode(operand2GR)
        return { bytecode }
      }
    }
  } else {
    // GR1+10 -> GR1
    const opCode = 0x20
    const wordLength = 2
    return {
      wordLength,
      tokens,
      gen: (
        grMap: Map<string, GeneralRegister>,
        labels: Map<string, Label>,
      ) => {
        // e.g. ADDA GR1,adr
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
        return { bytecode }
      }
    }
  }
}
