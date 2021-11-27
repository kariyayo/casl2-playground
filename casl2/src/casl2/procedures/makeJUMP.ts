import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, getGrOrThrow, grToBytecode, setPR } from "./registerAccessor"
import { isAddress, normalizeAddress } from "./strings"

export function makeJUMP(
  tokens: Tokens,
  labels: Map<string, Label>,
  grMap: Map<string, GeneralRegister>
): Instruction {
  const ts = tokens.operand.split(",")
  const operand = ts[0]
  const grx = ts.length > 1 ? ts[1] : null

  const opCode = 0x64
  const wordLength = 2

  let getAddress = () => 0
  if (isAddress(operand)) {
    getAddress = () => normalizeAddress(operand)
  } else {
    const label = getLabelOrThrow(operand, labels)
    getAddress = () => label.memAddress
  }

  const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
  return {
    wordLength,
    tokens,
    gen: () => {
      // e.g. JUMP adr,GR2 => [0x6402, address]
      const operandAddress = getAddress()
      const bytecode = new ArrayBuffer(4)
      const view = new DataView(bytecode)
      view.setUint8(0, opCode)
      view.setUint8(1, (0 << 4) + grToBytecode(indexGR))
      view.setUint16(2, operandAddress, false)
      return {
        bytecode,
        proc: (PR: GeneralRegister) => {
          let address = operandAddress
          if (indexGR != null) {
            address = address + indexGR.lookup()
          }
          setPR(PR, address)
        }
      }
    }
  }
}
