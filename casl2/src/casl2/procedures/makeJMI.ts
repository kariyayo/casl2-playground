import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, getGrOrThrow, grToBytecode } from "./registerAccessor"
import { isAddress, normalizeAddress } from "./strings"

export function makeJMI(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const operand = ts[0]

  const opCode = 0x61
  const wordLength = 2
  return {
    wordLength,
    tokens,
    gen: (
      grMap: Map<string, GeneralRegister>,
      labels: Map<string, Label>,
    ) => {
      const grx = ts.length > 1 ? ts[1] : null
      const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
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
      view.setUint8(1, (0 << 4) + grToBytecode(indexGR))
      view.setUint16(2, operandAddress, false)
      return { bytecode }
    }
  }
}
