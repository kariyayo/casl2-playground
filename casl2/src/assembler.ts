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
): AssembleResult {
  if (text == null || text.length == 0) {
    // NOP
    return []
  }

  const result = aggregateByLabel(text, startAddress, (newLabel: Label) => {
    labels.set(newLabel.label, newLabel)
  })

  if (result instanceof Error) {
    throw result
  }

  const assembleResult: AssembleResult = []
  result.forEach((aggregated) => {
    const [label, insts] = aggregated
    let memAddress = label.memAddress
    insts.forEach(inst => {
      const generated = inst.gen(grMap, labels)
      if (generated == null) {
        assembleResult.push({ memAddress, bytecode: null, tokens: inst.tokens })
      } else {
        const { bytecode } = generated
        memory.storeBytecode(bytecode, memAddress)
        assembleResult.push({ memAddress, bytecode, tokens: inst.tokens })
        memAddress = memAddress + inst.wordLength
      }
    })
  })
  return assembleResult
}
