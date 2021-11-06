import { tokenize } from "./tokenizer"
import { Tokens } from "./types"

const r = /^\s*;.*$/

export function aggregateByLabel(text: string): Map<string, Array<Tokens>> | Error {
  const result = new Map<string, Array<Tokens>>()
  const lines = text.split("\n")
  let currentLabel = ""
  let currentTokens: Array<Tokens> = []
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
    const label = tokenized.label
    if (label != "") {
      if (currentLabel != "") {
        result.set(currentLabel, currentTokens)
      }
      if (result.has(label)) {
        return new Error(`duplicated label: ${label}`)
      }
      currentLabel = label
      currentTokens = []
    }
    tokenized.operand = trimComment(tokenized.operand)
    currentTokens.push(tokenized)
  }
  result.set(currentLabel, currentTokens)
  return result
}

function trimComment(operand: string): string {
    const commentStartIdx = operand.search(" ")
    if (commentStartIdx >= 0) {
      return operand.substring(0, commentStartIdx)
    }
    return operand
}
