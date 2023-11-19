import { Instruction, Label, Tokens } from "../../types"

export function makeRET(tokens: Tokens): Instruction {
  const opCode = 0x81
  return {
    wordLength: 1,
    tokens,
    gen: (
      labels: Map<string, Label>,
    ) => {
      const bytecode = new ArrayBuffer(2)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, 0)
      return { bytecode }
    }
  }
}
