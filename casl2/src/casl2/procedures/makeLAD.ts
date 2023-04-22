import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"
import { isHexadecimal, isNumeric } from "./strings"

export function makeLAD(
  tokens: Tokens,
  labels: Map<string, Label>,
  grMap: Map<string, GeneralRegister>,
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
  } else if (isHexadecimal(value)) {
    getAddress = () => Number(parseInt(value.replace("#", ""), 16))
  } else {
    const label = getLabelOrThrow(value, labels)
    getAddress = () => label.memAddress
  }
  const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
  return {
    wordLength,
    tokens,
    gen: (memory: Memory) => {
      // e.g. LAD GR1,adr => [0x1210, address]
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
          distGR.store(address)
          advancePR(PR, wordLength)
        }
      }
    }
  }
}
