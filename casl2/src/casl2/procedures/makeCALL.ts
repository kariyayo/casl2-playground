import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { FlagRegister, GeneralRegister, getGrOrThrow, grToBytecode } from "./registerAccessor"
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
      grMap: Map<string, GeneralRegister>,
      flagRegister: FlagRegister,
      SP: GeneralRegister,
      memory: Memory,
      labels: Map<string, Label>,
      currentMemAddress?: number
    ) => {
      const grx = ts.length > 1 ? ts[1] : null
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
      view.setUint8(1, (0 << 4) + grToBytecode(indexGR))
      view.setUint16(2, operandAddress, false)
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          // PR -> memory(SP-1)
          // value -> PR
          let address = operandAddress
          if (indexGR != null) {
            address = address + indexGR.lookup()
          }
          SP.storeLogical(SP.lookupLogical()-1)
          memory.storeLogical(SP.lookupLogical(), PR.lookupLogical() + wordLength)
          PR.storeLogical(address)
        }
      }
    }
  }
}
