import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, isGeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"

export function makeLD(
  tokens: Tokens,
  labels: Map<string, Label>,
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
            distGR.store(srcGR.lookup())
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
    const r = /#?[0-9]+/
    if (r.test(value)) {
      getAddress = () => Number(value.replace("#", ""))
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
        let address = getAddress()
        if (indexGR != null) {
          address = address + indexGR.lookup()
        }
        const bytecode = new ArrayBuffer(4)
        const view = new DataView(bytecode)
        view.setUint8(0, opCode)
        view.setUint8(1, (grToBytecode(distGR) << 4) + grToBytecode(indexGR))
        view.setUint16(2, address, false)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            distGR.store(memory.lookup(address))
            advancePR(PR, wordLength)
          }
        }
      }
    }
  }
}
