import { Instruction, Label, Tokens } from "../../types"
import { GeneralRegister, getGrOrThrow, grToBytecode } from "./registerAccessor"

export function makePOP(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const operand = ts[0]

  const opCode = 0x71
  const wordLength = 1
  return {
    wordLength,
    tokens,
    gen: (
      grMap: Map<string, GeneralRegister>,
      labels: Map<string, Label>,
    ) => {
      const targetGR = getGrOrThrow(operand, grMap)
      const bytecode = new ArrayBuffer(4)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, (grToBytecode(targetGR) << 4) + 0)
      return { bytecode }
    }
  }
}
