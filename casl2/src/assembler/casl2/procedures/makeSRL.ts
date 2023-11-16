import { Instruction, Label, Tokens } from "../../types"
import { getLabelOrThrow } from "./labelAccessor"
import { getGrByteCodeOrThrow } from "./registerAccessor"
import { isNumeric } from "./strings"

export function makeSRL(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]

  // GR1 >>> 2 -> GR1
  const opCode = 0x53
  const wordLength = 2
  return {
    wordLength,
    tokens,
    gen: (
      labels: Map<string, Label>,
    ) => {
      // e.g. SRL GR1,adr
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
