import { Instruction, Label, Tokens } from "../../types"
import { getGrByteCodeOrThrow } from "./registerAccessor"

export function makePOP(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const operand = ts[0]

  const opCode = 0x71
  const wordLength = 1
  return {
    wordLength,
    tokens,
    gen: (
      labels: Map<string, Label>,
    ) => {
      const targetGR = getGrByteCodeOrThrow(operand)
      const bytecode = new ArrayBuffer(4)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, (targetGR << 4) + 0)
      return { bytecode }
    }
  }
}
