import { Memory, START_ADDRESS, WORD_LENGTH } from "../../infra/memory"
import { Label } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { makeDC } from "./makeDC"

describe(`makeDC`, () => {
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 2000})

  describe.each([
    {
       tokens: { lineNum: 0, instructionNum: 2, label: "AA", operator: "DC", operand: "30" },
       expected: 30
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const memory = new Memory()

    // when, then

    makeDC(tokens, labels, memory)
    test(`Label "AA" should be loaded address`, () => {
      expect(memory.lookup(getLabelOrThrow("AA", labels).memAddress)).toEqual(expected)
    })
  })

  describe.each([
    {
       tokens: { lineNum: 0, instructionNum: 2, label: "", operator: "DC", operand: "30" },
       expected: 30
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const memory = new Memory()

    // when, then

    makeDC(tokens, labels, memory)
    test(`memory#(start+2inst) should be loaded address`, () => {
      expect(memory.lookup(START_ADDRESS+(tokens.instructionNum*WORD_LENGTH))).toEqual(expected)
    })
  })
})
