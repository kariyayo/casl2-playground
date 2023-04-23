import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, isGeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"
import { isAddress, normalizeAddress } from "./strings"

export function makeST(
  tokens: Tokens,
  grMap: Map<string, GeneralRegister>,
): Instruction {
  const ts = tokens.operand.split(",")
  const src = ts[0]
  const value = ts[1]
  const srcGR = getGrOrThrow(src, grMap)
  const grx = ts.length > 2 ? ts[2] : null

  // GR -> memory
  const opCode = 0x11
  const wordLength = 2
  const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
  return {
    wordLength,
    tokens,
    gen: (
      memory: Memory,
      labels: Map<string, Label>,
      currentMemAddress?: number,
    ) => {
      // e.g. ST GR1,adr => [0x1110, address]
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
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          let address = operandAddress
          if (indexGR != null) {
            address = address + indexGR.lookup()
          }
          const value = srcGR.lookup()
          memory.store(address, value)
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
