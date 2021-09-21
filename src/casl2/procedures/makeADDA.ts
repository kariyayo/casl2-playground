import { Memory } from "../../infra/memory"
import { Instruction, Label, Tokens } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { GeneralRegister, FlagRegister, isGeneralRegister, getGrOrThrow, grToBytecode, advancePR } from "./registerAccessor"

const numFmt = /[0-9]+/
function isNumeric(s: string): boolean {
  return numFmt.test(s)
}

export function makeADDA(
  tokens: Tokens,
  labels: Map<string, Label>,
  flagRegister: FlagRegister,
  grMap: Map<string, GeneralRegister>,
  memory: Memory
): Instruction {
  const ts = tokens.operand.split(",")
  const operand1 = ts[0]
  const target = ts[1]
  const grx = ts.length > 2 ? ts[2] : null

  if (isGeneralRegister(target)) {
    // GR1+GR2 -> GR1
    const opCode = 0x24
    const wordLength = 1
    const operand1GR = getGrOrThrow(operand1, grMap)
    const operand2GR = getGrOrThrow(target, grMap)
    return {
      wordLength,
      tokens,
      gen: () => {
        // e.g. ADDA GR1,GR2
        const bytecode = new ArrayBuffer(2)
        const byteArray = new Uint8Array(bytecode, 0, 2)
        byteArray[0] = opCode
        byteArray[1] = (grToBytecode(operand1GR) << 4) + grToBytecode(operand2GR)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            const v = operand1GR.lookup() + operand2GR.lookup()
            setFragRegister(flagRegister, v)
            operand1GR.store(v)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  } else {
    // GR1+10 -> GR1
    const opCode = 0x20
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
      gen: () => {
        // e.g. ADDA GR1,adr
        let address = getAddress()
        if (indexGR != null) {
          address = address + indexGR.lookup()
        }
        const bytecode = new ArrayBuffer(4)
        const view = new DataView(bytecode)
        view.setUint8(0, opCode)
        view.setUint8(1, (grToBytecode(operand1GR) << 4) + grToBytecode(indexGR))
        view.setUint16(2, address, false)
        return {
          bytecode,
          proc: (PR: GeneralRegister) => {
            const v = operand1GR.lookup() + memory.lookup(address)
            setFragRegister(flagRegister, v)
            operand1GR.store(v)
            advancePR(PR, wordLength)
          }
        }
      }
    }
  }
}

function setFragRegister(flagRegister: FlagRegister, appliedValue: number) {
  if (-32768 <= appliedValue && appliedValue <= 32767) {
    flagRegister.overflowFlag = false
  } else {
    flagRegister.overflowFlag = true
  }
  if (appliedValue < 0) {
    flagRegister.signFlag = true
  } else {
    flagRegister.signFlag = false
  }
  if (appliedValue == 0) {
    flagRegister.zeroFlag = true
  } else {
    flagRegister.zeroFlag = false
  }
}
