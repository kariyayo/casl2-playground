import { tokenize } from "./tokenizer"
import { Instruction, Label, Tokens } from "./types"
import { makeProcedure } from "./procedureFactory"
import { AssembleError } from "../AssembleError"

const r = /^\s*;.*$/

export function aggregateByLabel(
  text: string,
  startAddress: number,
  labelUpdateAction: (newLabel: Label) => void
): Map<string, [Label, Array<Instruction>]> | Error {
  let currentAddress = startAddress
  const result = new Map<string, [Label, Array<Instruction>]>()
  const lines = text.split("\n")
  let currentLabel: Label | null = null
  let currentInstructions: Array<Instruction> = []
  let instructionNum = 0
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]
    if (r.test(line)) {
      // Comment Line
      continue
    }

    // line -> tokens
    const tokenized = tokenize(line, lineNum, instructionNum)
    if (tokenized instanceof Error) {
      return tokenized
    }
    instructionNum++

    // update LABEL
    const newLabel = tokenized.label
    if (newLabel != "") {
      if (currentLabel != null) {
        result.set(currentLabel.label, [currentLabel, currentInstructions])
      }
      if (result.has(newLabel)) {
        return new Error(`duplicated label: ${newLabel}`)
      }
      currentLabel = { label: newLabel, memAddress: currentAddress }
      labelUpdateAction(currentLabel)
      currentInstructions = []
    }

    // tokens -> inst
    tokenized.operand = trimComment(tokenized.operand)
    const inst = createInstruction(tokenized)
    currentInstructions.push(inst)

    // advance address
    currentAddress = currentAddress + inst.wordLength
  }

  if (currentLabel != null) {
    result.set(currentLabel.label, [currentLabel, currentInstructions])
  }

  return result
}

function createInstruction(tokens: Tokens): Instruction {
  try {
    const inst = makeProcedure(tokens)
    return inst
  } catch(e) {
    if (e instanceof Error) {
      throw new AssembleError(tokens, e)
    } else {
      throw e
    }
  }
}

function trimComment(operand: string): string {
    const commentStartIdx = operand.search(" ")
    if (commentStartIdx >= 0) {
      return operand.substring(0, commentStartIdx)
    }
    return operand
}
