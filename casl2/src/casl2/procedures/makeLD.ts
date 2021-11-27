import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, isGeneralRegister, getGrOrThrow, grToBytecode, advancePR, FlagRegister } from "./registerAccessor"
import { isAddress, normalizeAddress } from "./strings"

export function makeLD(
  tokens: Tokens,
  labels: Map<string, Label>,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
  memory: Memory
): Instruction {
  const ts = tokens.operand.split(",")
  const target = ts[0]
  const value = ts[1]
  const distGR = getGrOrThrow(target, grMap)
  const grx = ts.length > 2 ? ts[2] : null

  if (isGeneralRegister(value)) {
    // GR -> GR
    const opCode = 0x14
    const wordLength = 1
    const srcGR = getGrOrThrow(value, grMap)
    if (grx != null) {
      throw new Error(`cannot use GRx: ${tokens}`)
    }
    return {
      wordLength,
      tokens,
      gen: () => {
        // e.g. LD GR1,GR2 => [0x1412]
        const bytecode = new ArrayBuffer(2)
        const byteArray = new Uint8Array(bytecode, 0, 2)
        byteArray[0] = opCode
        byteArray[1] = (grToBytecode(distGR) << 4) + grToBytecode(srcGR)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            const value = srcGR.lookup()
            distGR.store(value)
            flagRegister.set(value)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  } else {
    // memory -> GR
    const opCode = 0x10
    const wordLength = 2
    let getAddress = () => 0
    if (isAddress(value)) {
      getAddress = () => normalizeAddress(value)
    } else {
      const label = getLabelOrThrow(value, labels)
      getAddress = () => label.memAddress
    }
    const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
    return {
      wordLength,
      tokens,
      gen: () => {
        // e.g. LD GR1,adr => [0x1010, address]
        const operandAddress = getAddress()
        const bytecode = new ArrayBuffer(4)
        const view = new DataView(bytecode)
        view.setUint8(0, opCode)
        view.setUint8(1, (grToBytecode(distGR) << 4) + grToBytecode(indexGR))
        view.setUint16(2, operandAddress, false)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            let address = operandAddress
            if (indexGR != null) {
              address = address + indexGR.lookup()
            }
            const value = memory.lookup(address)
            distGR.store(value)
            flagRegister.set(value)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  }
}
