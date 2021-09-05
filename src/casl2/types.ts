export type Label = {
  label: string
  memAddress: number
}

export type Instruction = {
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
