import { Memory } from "../../infra/memory"
import { Label } from "../types"
import { getLabelOrThrow } from "./labelAccessor"
import { execDC } from "./execDC"

describe(`makeDC`, () => {
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 2000})

  describe.each([
    {
      params: {
        tokens: { lineNum: 0, instructionNum: 2, label: "AA", operator: "DC", operand: "30" },
        currentMemAddress: 1010,
      },
      expected: 30
    },
  ])(`$# :: $params`, ({params, expected}) => {
    // given
    const memory = new Memory()

    // when, then

    const res = execDC(params.tokens, labels, memory)
    test(`makeDC() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(1)
    })
    res?.gen(params.currentMemAddress)
    test(`Label "${params.tokens.label}" should be loaded address`, () => {
      expect(memory.lookup(getLabelOrThrow(params.tokens.label, labels).memAddress)).toEqual(expected)
    })
  })

  describe.each([
    {
      params: {
        tokens: { lineNum: 0, instructionNum: 2, label: "", operator: "DC", operand: "30" },
        currentMemAddress: 1020,
      },
      expected: 30
    },
    {
      params: {
        tokens: { lineNum: 0, instructionNum: 2, label: "", operator: "DC", operand: "-123" },
        currentMemAddress: 1020,
      },
      expected: 65413 // -123
    },
    {
      params: {
        tokens: { lineNum: 0, instructionNum: 2, label: "", operator: "DC", operand: "#0000" },
        currentMemAddress: 1020,
      },
      expected: 0
    },
    {
      params: {
        tokens: { lineNum: 0, instructionNum: 2, label: "", operator: "DC", operand: "#FFFF" },
        currentMemAddress: 1020,
      },
      expected: 65535
    },
  ])(`$# :: $params`, ({params, expected}) => {
    // given
    const memory = new Memory()

    // when, then

    const res = execDC(params.tokens, labels, memory)
    test(`makeDC() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(1)
    })
    res?.gen(params.currentMemAddress)
    test(`memory#(start+2inst) should be loaded address`, () => {
      expect(memory.lookupLogical(params.currentMemAddress)).toEqual(expected)
    })
  })
})
