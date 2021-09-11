import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, isGeneralRegister, getGrOrThrow, grToBytecode } from "./registerAccessor"

const numFmt = /[0-9]+/
function isNumeric(s: string): boolean {
  return numFmt.test(s)
}

export function makeLAD(
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

  const opCode = 0x12
  const wordLength = 2

  let getAddress = () => 0
  if (isNumeric(value)) {
    getAddress = () => Number(value)
  } else {
    const label = getLabelOrThrow(value, labels)
    getAddress = () => label.memAddress
  }
  const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
  return {
    wordLength,
    tokens,
    gen: () => {
      // e.g. LAD GR1,adr => [0x1210, address]
      let address = getAddress()
      if (grx != null) {
        const indexGR = getGrOrThrow(grx, grMap)
        address = address + indexGR.lookup()
      }
      const bytecode = new ArrayBuffer(4)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, (grToBytecode(distGR) << 4) + grToBytecode(indexGR))
      view.setUint16(2, address, false)
      return {
        bytecode,
        proc: () => distGR.store(address)
      }
    }
  }
}
