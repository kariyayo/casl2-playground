import { Memory } from "../../infra/memory"
import { Label } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { makeDC } from "./makeDC"

describe(`makeDC`, () => {
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 2000})

  describe.each([
    { tokens: { lineNum: 0, instructionNum: 0, label: "AA", operator: "DC", operand: "30" }, expected: 30},
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const memory = new Memory()

    // when, then

    const res = makeDC(tokens, labels, memory)
    test(`makeDC returns function`, () => {
      expect(res).not.toBeNull()
    })
    res?.proc()
    test(`Label "AA" should be loaded address`, () => {
      expect(memory.lookup(getLabelOrThrow("AA", labels).memAddress)).toEqual(expected)
    })
  })
})
