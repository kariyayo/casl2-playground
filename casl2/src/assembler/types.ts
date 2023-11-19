export type Label = {
  label: string
  memAddress: number
}

export type Instruction = {
  wordLength: number
  tokens: Tokens
  gen: (
    labels: Map<string, Label>,
  ) => null | {
    bytecode: ArrayBuffer
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
