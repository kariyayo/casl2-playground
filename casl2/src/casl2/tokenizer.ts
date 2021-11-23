import { Tokens } from "./types"

const splitReg = /\t+/

export function tokenize(line: string, lineNum: number, instructionNum: number): Tokens | Error {
	let result = line.trimRight().split(splitReg)
	if (result.length == 2) {
		result = result.concat("")
	}
	if (result.length != 3) {
		return new Error(`invalid token num. L${lineNum+1} line:"${line}"`)
	}
	return new Tokens(
		lineNum,
		instructionNum,
		result[0],
		result[1],
		result[2],
	)
}
