import { Tokens, tokenize } from "./tokenizer"

const r = /^\s*;.*$/

export function aggregateByLabel(text: string): Map<string, Array<Tokens>> | Error {
  const result = new Map<string, Array<Tokens>>()
  const lines = text.split("\n")
  let currentLabel = ""
  let currentTokens: Array<Tokens> = []
  for (const line of lines) {
    if (r.test(line)) {
      // Comment Line
      continue
    }
    // line -> tokens
    const tokenized = tokenize(line)
    if (tokenized instanceof Error) {
      return tokenized
    }
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
