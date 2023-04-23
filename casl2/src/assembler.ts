import { Memory } from "./infra/memory";
import { FlagRegister, GeneralRegister } from "./infra/register";
import { aggregateByLabel } from "./casl2/parser";
import { makeProcedure } from "./casl2/procedureFactory";
import { Instruction, Tokens } from "./casl2/types";
import { AssembleError } from "./AssembleError";

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

  const aggregated = aggregateByLabel(text)
  if (aggregated instanceof Error) {
    throw aggregated
  }

  for (let label of aggregated.keys()) {
    labels.set(label, { label, memAddress: 0})
  }

  const labelInstructionMap: Map<Label, Array<Instruction>> = new Map()

  let memAddress = startAddress
  aggregated.forEach((lines, labelText) => {
    const label = labels.get(labelText)
    if (label == null) throw Error("")

    // set label address
    label.memAddress = memAddress

    // set instructions by label
    const instructions = new Array<Instruction>()
    lines.forEach((tokens) => {
      try {
        const inst = makeProcedure(tokens)
        if (inst != null) {
          instructions.push(inst)
          const wordLength = inst.wordLength
          memAddress = memAddress + wordLength
        }
      } catch(e) {
        if (e instanceof Error) {
          throw new AssembleError(tokens, e)
        } else {
          throw e
        }
      }
    })
    labelInstructionMap.set(label, instructions)
  })

  const assembleResult: AssembleResult = []
  const procMap: ProcMap = new Map()
  labelInstructionMap.forEach((insts, label) => {
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
