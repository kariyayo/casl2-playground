import { GeneralRegister } from "../infra/register"

export type Label = {
  label: string
  memAddress: number
}

export type Instruction = {
  wordLength: number
  tokens: Tokens
  gen: (currentMemAddress?: number) => null | {
    bytecode: ArrayBuffer
    proc: (PR: GeneralRegister) => void
  }
}

export type Tokens = {
  lineNum: number
  instructionNum: number
	label: string
	operator: string
	operand: string
}
