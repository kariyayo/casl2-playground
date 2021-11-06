import { Instruction, Tokens } from "../types"
import { advancePR, FlagRegister, GeneralRegister, getGrOrThrow, grToBytecode, setPR } from "./registerAccessor"
import { isDigits } from "./strings"

export function makeJPL(
  tokens: Tokens,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>
): Instruction {
  const ts = tokens.operand.split(",")
  const operand = ts[0]
  const grx = ts.length > 1 ? ts[1] : null

  const opCode = 0x65
  const wordLength = 2

  let targetAddress = 0
  if (!isDigits(operand)) {
    throw new Error(`operand should be positive number: ${tokens}`)
  }
  targetAddress = Number(operand)

  const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
  return {
    wordLength,
    tokens,
    gen: () => {
      const operandAddress = targetAddress
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
          if (flagRegister.sf()) {
            advancePR(PR, 2)
          } else {
            setPR(PR, address)
          }
        }
      }
    }
  }
}
