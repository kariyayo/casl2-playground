import { Memory } from "../infra/memory"
import { GeneralRegister } from "../infra/register"

export type Label = {
  label: string
  memAddress: number
}

export type Instruction = {
  wordLength: number
  tokens: Tokens
  gen: (memory: Memory, currentMemAddress?: number) => null | {
    bytecode: ArrayBuffer
    proc: (PR: GeneralRegister) => void
  }
}

export class Tokens {
  lineNum: number
  instructionNum: number
	label: string
	operator: string
	operand: string

  constructor(lineNum: number, instructionNum: number, label: string, operator: string, operand: string) {
    this.lineNum = lineNum
    this.instructionNum = instructionNum
    this.label = label
    this.operator = operator
    this.operand = operand
  }

  toString(): string {
    return JSON.stringify(this)
  }
}
