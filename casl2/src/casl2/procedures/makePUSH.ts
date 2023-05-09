import { Instruction, Label, Tokens } from "../types"
import { GeneralRegister, getGrOrThrow, grToBytecode } from "./registerAccessor"
import { isAddress, normalizeAddress } from "./strings"

export function makePUSH(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const value = ts[0]

  const opCode = 0x70
  const wordLength = 2
  return {
    wordLength,
    tokens,
    gen: (
      grMap: Map<string, GeneralRegister>,
      labels: Map<string, Label>,
    ) => {
      if (!isAddress(value)) {
        throw new Error(`operand should be address: ${tokens}`)
      }
      const operandAddress = normalizeAddress(value)
      const grx = ts.length > 1 ? ts[1] : null
      const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
      const bytecode = new ArrayBuffer(4)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, (0 << 4) + grToBytecode(indexGR))
      view.setUint16(2, operandAddress, false)
      return { bytecode }
    }
  }
}
