import { Instruction, Label, Tokens } from "../../types"
import { getLabelOrThrow } from "./labelAccessor"
import { getGrByteCodeOrThrow } from "./registerAccessor"
import { isAddress, normalizeAddress } from "./strings"

export function makeJUMP(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const operand = ts[0]

  const opCode = 0x64
  const wordLength = 2
  return {
    wordLength,
    tokens,
    gen: (
      labels: Map<string, Label>,
    ) => {
      // e.g. JUMP adr,GR2 => [0x6402, address]
      const grx = ts.length > 1 ? ts[1] : null
      const indexGR = grx == null ? 0 : getGrByteCodeOrThrow(grx)
      let operandAddress = 0
      if (isAddress(operand)) {
        operandAddress = normalizeAddress(operand)
      } else {
        const label = getLabelOrThrow(operand, labels)
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
