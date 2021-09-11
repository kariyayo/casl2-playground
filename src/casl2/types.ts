export type Label = {
  label: string
  memAddress: number
}

export type Instruction = {
  wordLength: number
  tokens: Tokens
  gen: () => {
    bytecode: ArrayBuffer
    proc: () => void
  }
}

export type Tokens = {
  lineNum: number
  instructionNum: number
	label: string
	operator: string
	operand: string
}
