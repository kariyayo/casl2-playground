export type Label = {
  label: string
  memAddress: number
}

export type Instruction = {
  wordLength: number
  tokens: Tokens
  proc: () => void
}

export type Tokens = {
  lineNum: number
  instructionNum: number
	label: string
	operator: string
	operand: string
}
