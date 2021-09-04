export type Label = {
  label: string
  memAddress: number
}

export type Instruction = {
  tokens: Tokens
  proc: () => void
}

export type Tokens = {
	label: string
	operator: string
	operand: string
}
