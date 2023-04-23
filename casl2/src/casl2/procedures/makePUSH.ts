import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { FlagRegister, GeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"
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
      flagRegister: FlagRegister,
      SP: GeneralRegister,
      memory: Memory,
      labels: Map<string, Label>,
      currentMemAddress?: number
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
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          // value -> memory(SP-1)
          let address = operandAddress
          if (indexGR != null) {
            address = address + indexGR.lookup()
          }
          SP.storeLogical(SP.lookupLogical()-1)
          memory.storeLogical(SP.lookupLogical(), address)
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
