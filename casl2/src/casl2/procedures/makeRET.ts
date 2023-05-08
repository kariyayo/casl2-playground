import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { GeneralRegister } from "./registerAccessor"

export function makeRET(tokens: Tokens): Instruction {
  const opCode = 0x81
  return {
    wordLength: 1,
    tokens,
    gen: (
      grMap: Map<string, GeneralRegister>,
      memory: Memory,
      labels: Map<string, Label>,
      currentMemAddress?: number
    ) => {
      const bytecode = new ArrayBuffer(2)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, 0)
      return { bytecode }
    }
  }
}
