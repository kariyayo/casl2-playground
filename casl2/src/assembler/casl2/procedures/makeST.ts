import { Instruction, Label, Tokens } from "../../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, getGrOrThrow, grToBytecode } from "./registerAccessor"
import { isAddress, normalizeAddress } from "./strings"

export function makeST(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const src = ts[0]
  const value = ts[1]

  // GR -> memory
  const opCode = 0x11
  const wordLength = 2
  return {
    wordLength,
    tokens,
    gen: (
      grMap: Map<string, GeneralRegister>,
      labels: Map<string, Label>,
    ) => {
      // e.g. ST GR1,adr => [0x1110, address]
      const srcGR = getGrOrThrow(src, grMap)
      const grx = ts.length > 2 ? ts[2] : null
      const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
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
      view.setUint8(1, (grToBytecode(srcGR) << 4) + grToBytecode(indexGR))
      view.setUint16(2, operandAddress, false)
      return { bytecode }
    }
  }
}
