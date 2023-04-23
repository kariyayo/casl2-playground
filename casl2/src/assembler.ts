import { Memory } from "./infra/memory";
import { FlagRegister, GeneralRegister } from "./infra/register";
import { aggregateByLabel } from "./casl2/parser";
import { Tokens } from "./casl2/types";

type Label = {
  label: string
  memAddress: number
}

export type AssembleResult = Array<{
    memAddress: number,
    bytecode: ArrayBuffer | null,
    tokens: Tokens,
}>

export type ProcMap = Map<number, {
    bytecode: ArrayBuffer,
    proc: (PR: GeneralRegister) => void
}>

export function display(result: AssembleResult): string {
  return result.map(row => {
    let v: any = ""
    if (row.bytecode != null) {
      const view = new DataView(row.bytecode)
      if (row.bytecode.byteLength >= 2) {
        v = view.getUint8(0).toString(16).padStart(2, "0")
        v = v + view.getUint8(1).toString(16).padStart(2, "0")
      }
      if (row.bytecode.byteLength >= 4) {
        v = v + " "
        v = v + view.getUint16(2).toString(16).padStart(4, "0")
      }
    }
    return `${row.memAddress}	${v}	${row.tokens.label || "	"}	${row.tokens.operator}	${row.tokens.operand}`
  }).join("\n")
}

export function assemble(
  startAddress: number,
  text: string,
  labels: Map<string, Label>,
  FR: FlagRegister,
  grMap: Map<string, GeneralRegister>,
  memory: Memory,
  SP: GeneralRegister,
): { assembleResult: AssembleResult, procMap: ProcMap } {
  if (text == null || text.length == 0) {
    // NOP
    return { assembleResult: [], procMap: new Map() }
  }

  const result = aggregateByLabel(text, startAddress, (newLabel: Label) => {
    labels.set(newLabel.label, newLabel)
  })

  if (result instanceof Error) {
    throw result
  }

  const assembleResult: AssembleResult = []
  const procMap: ProcMap = new Map()
  result.forEach((aggregated) => {
    const [label, insts] = aggregated
    let memAddress = label.memAddress
    insts.forEach(inst => {
      const generated = inst.gen(grMap, FR, SP, memory, labels, memAddress)
      if (generated == null) {
        assembleResult.push({ memAddress, bytecode: null, tokens: inst.tokens })
      } else {
        const { bytecode, proc } = generated
        const bs = new Uint8Array(bytecode)
        memory.storeLogical(memAddress, (bs[0] << 8) + bs[1])
        if (inst.wordLength == 2) {
          memory.storeLogical(memAddress+1, (bs[2] << 8) + bs[3])
        }
        assembleResult.push({ memAddress, bytecode, tokens: inst.tokens })
        procMap.set(memAddress, { bytecode, proc })
        memAddress = memAddress + inst.wordLength
      }
    })
  })
  return { assembleResult, procMap }
}
