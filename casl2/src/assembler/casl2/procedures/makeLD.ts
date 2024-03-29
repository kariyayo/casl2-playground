import { Instruction, Label, Tokens } from "../../types"
import { getLabelOrThrow } from "./labelAccessor"
import { isGeneralRegister, getGrByteCodeOrThrow } from "./registerAccessor"
import { isAddress, normalizeAddress } from "./strings"

export function makeLD(tokens: Tokens): Instruction {
  const ts = tokens.operand.split(",")
  const target = ts[0]
  const value = ts[1]
  if (isGeneralRegister(value)) {
    // GR -> GR
    const opCode = 0x14
    const wordLength = 1
    return {
      wordLength,
      tokens,
      gen: (
        labels: Map<string, Label>,
      ) => {
        // e.g. LD GR1,GR2 => [0x1412]
        const distGR = getGrByteCodeOrThrow(target)
        const grx = ts.length > 2 ? ts[2] : null
        const srcGR = getGrByteCodeOrThrow(value)
        if (grx != null) {
          throw new Error(`cannot use GRx: ${tokens}`)
        }
        const bytecode = new ArrayBuffer(2)
        const byteArray = new Uint8Array(bytecode, 0, 2)
        byteArray[0] = opCode
        byteArray[1] = (distGR << 4) + srcGR
        return { bytecode }
      }
    }
  } else {
    // memory -> GR
    const opCode = 0x10
    const wordLength = 2
    return {
      wordLength,
      tokens,
      gen: (
        labels: Map<string, Label>,
      ) => {
        // e.g. LD GR1,adr => [0x1010, address]
        const distGR = getGrByteCodeOrThrow(target)
        const grx = ts.length > 2 ? ts[2] : null
        const indexGR = grx == null ? 0 : getGrByteCodeOrThrow(grx)
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
        view.setUint8(1, (distGR << 4) + indexGR)
        view.setUint16(2, operandAddress, false)
        return { bytecode }
      }
    }
  }
}
