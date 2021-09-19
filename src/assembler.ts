import { Memory } from "./infra/memory";
import { FlagRegister, GeneralRegister } from "./infra/register";
import { aggregateByLabel } from "./casl2/parser";
import { makeProcedure } from "./casl2/procedureFactory";
import { Instruction, Tokens } from "./casl2/types";

type Label = {
  label: string
  memAddress: number
}

export type AssembleResult = Array<{
    memAddress: number,
    bytecode: ArrayBuffer,
    tokens: Tokens
}>

export function display(result: AssembleResult): string {
  return result.map(row => {
    let v: any = ""
    if (row.bytecode.byteLength != 0) {
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
  memory: Memory
): AssembleResult {
  if (text == null || text.length == 0) {
    // NOP
    return []
  }

  const aggregated = aggregateByLabel(text)
  if (aggregated instanceof Error) {
    throw aggregated
  }

  for (let label of aggregated.keys()) {
    labels.set(label, { label, memAddress: 0})
  }

  const labelInstructionMap: Map<Label, Array<Instruction>> = new Map()

  const assembleResult: AssembleResult = []
  let memAddress = startAddress
  aggregated.forEach((lines, labelText) => {
    const label = labels.get(labelText)
    if (label == null) throw Error("")

    // set label address
    label.memAddress = memAddress

    // set instructions by label
    const instructions = new Array<Instruction>()
    lines.forEach((tokens) => {
      const inst = makeProcedure(
        tokens,
        labels,
        FR,
        grMap,
        memory
      )
      if (inst != null) {
        instructions.push(inst)
        const wordLength = inst.wordLength
        memAddress = memAddress + wordLength
      }
    })
    labelInstructionMap.set(label, instructions)
  })

  labelInstructionMap.forEach((insts, label) => {
    let memAddress = label.memAddress
    insts.forEach(inst => {
      const { bytecode, proc } = inst.gen(memAddress)
      assembleResult.push({ memAddress, bytecode, tokens: inst.tokens })
      memAddress = memAddress + inst.wordLength
    })
  })
  return assembleResult
}
