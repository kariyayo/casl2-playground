import { Instruction, Label, Tokens } from "../../types"
import { getLabelOrThrow } from "./labelAccessor"
import { getGrByteCodeOrThrow } from "./registerAccessor"
import { isAddress, normalizeAddress } from "./strings"

export function makeCALL(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const value = ts[0]

  const opCode = 0x80
  const wordLength = 2
  return {
    wordLength,
    tokens,
    gen: (
      labels: Map<string, Label>,
    ) => {
      const grx = ts.length > 1 ? ts[1] : null
      const indexGR = grx == null ? 0 : getGrByteCodeOrThrow(grx)
      let operandAddress = 0
      if (isAddress(value)) {
        operandAddress = normalizeAddress(value)
      } else {
        const label = getLabelOrThrow(value, labels)
        operandAddress = label.memAddress
      }
      const bytecode = new ArrayBuffer(4)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, (0 << 4) + indexGR)
      view.setUint16(2, operandAddress, false)
      return { bytecode }
    }
  }
}
