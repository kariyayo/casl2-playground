import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, FlagRegister, isGeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"
import { isNumeric } from "./strings"

export function makeCPA(
  tokens: Tokens,
  labels: Map<string, Label>,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]
  const grx = ts.length > 2 ? ts[2] : null

  if (isGeneralRegister(target)) {
    // GR1 > GR2 -> FR
    const opCode = 0x44
    const wordLength = 1
    const operand1GR = getGrOrThrow(operand1, grMap)
    const operand2GR = getGrOrThrow(target, grMap)
    return {
      wordLength,
      tokens,
      gen: () => {
        const bytecode = new ArrayBuffer(2)
        const byteArray = new Uint8Array(bytecode, 0, 2)
        byteArray[0] = opCode
        byteArray[1] = (grToBytecode(operand1GR) << 4) + grToBytecode(operand2GR)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            const v = operand1GR.lookup() - operand2GR.lookup()
            flagRegister.setByCPA(v)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  } else {
    // GR1 > memory(10) -> FR
    const opCode = 0x40
    const wordLength = 2
    const operand1GR = getGrOrThrow(operand1, grMap)
    let getAddress = () => 0
    if (isNumeric(target)) {
      getAddress = () => Number(target)
    } else {
      getAddress = () => getLabelOrThrow(target, labels).memAddress
    }
    const indexGR = grx == null ? null : getGrOrThrow(grx, grMap)
    return {
      wordLength,
      tokens,
      gen: (memory: Memory) => {
        const operandAddress = getAddress()
        const bytecode = new ArrayBuffer(4)
        const view = new DataView(bytecode)
        view.setUint8(0, opCode)
        view.setUint8(1, (grToBytecode(operand1GR) << 4) + grToBytecode(indexGR))
        view.setUint16(2, operandAddress, false)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            let address = operandAddress
            if (indexGR != null) {
              address = address + indexGR.lookup()
            }
            const v = operand1GR.lookup() - memory.lookup(address)
            flagRegister.setByCPA(v)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  }
}
