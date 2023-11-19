import { Instruction, Label, Tokens } from "../../types"
import { getLabelOrThrow } from "./labelAccessor"
import { isGeneralRegister, getGrByteCodeOrThrow } from "./registerAccessor"
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
        labels: Map<string, Label>,
      ) => {
        const operand1GR = getGrByteCodeOrThrow(operand1)
        const operand2GR = getGrByteCodeOrThrow(target)
        const bytecode = new ArrayBuffer(2)
        const byteArray = new Uint8Array(bytecode, 0, 2)
        byteArray[0] = opCode
        byteArray[1] = (operand1GR << 4) + operand2GR
        return { bytecode }
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
        labels: Map<string, Label>,
      ) => {
        const grx = ts.length > 2 ? ts[2] : null
        const operand1GR = getGrByteCodeOrThrow(operand1)
        const indexGR = grx == null ? 0 : getGrByteCodeOrThrow(grx)
        let operandAddress = 0
        if (isNumeric(target)) {
          operandAddress = Number(target)
        } else {
          operandAddress = getLabelOrThrow(target, labels).memAddress
        }
        const bytecode = new ArrayBuffer(4)
        const view = new DataView(bytecode)
        view.setUint8(0, opCode)
        view.setUint8(1, (operand1GR << 4) + indexGR)
        view.setUint16(2, operandAddress, false)
        return { bytecode }
      }
    }
  }
}
