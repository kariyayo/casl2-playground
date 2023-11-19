import { Instruction, Label, Tokens } from "../../types"
import { getLabelOrThrow } from "./labelAccessor"
import { getGrByteCodeOrThrow } from "./registerAccessor"
import { isHexadecimal, isNumeric } from "./strings"

export function makeLAD(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const target = ts[0]
  const value = ts[1]

  const opCode = 0x12
  const wordLength = 2
  return {
    wordLength,
    tokens,
    gen: (
      labels: Map<string, Label>,
    ) => {
      // e.g. LAD GR1,adr => [0x1210, address]
      const distGR = getGrByteCodeOrThrow(target)
      const grx = ts.length > 2 ? ts[2] : null
      const indexGR = grx == null ? 0 : getGrByteCodeOrThrow(grx)
      let operandAddress = 0
      if (isNumeric(value)) {
        operandAddress = Number(value)
      } else if (isHexadecimal(value)) {
        operandAddress = Number(parseInt(value.replace("#", ""), 16))
      } else {
        const label = getLabelOrThrow(value, labels)
        operandAddress = label.memAddress
      }
      const bytecode = new ArrayBuffer(4)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, (distGR << 4) + indexGR)
      view.setUint16(2, operandAddress, false)
      return { bytecode }
    }
  }
}
