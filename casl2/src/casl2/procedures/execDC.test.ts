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
      expected: { value1: 30, value2: null, wordLength: 1 }
    },
    {
      params: {
        tokens: { lineNum: 0, instructionNum: 2, label: "AA", operator: "DC", operand: "30,#000A,-1" },
        currentMemAddress: 1010,
      },
      expected: { value1: 30, value2: 10, value3: -1, wordLength: 3 }
    },
  ])(`$# :: $params`, ({params, expected}) => {
    // given
    const memory = new Memory()

    // when, then

    const res = execDC(params.tokens, labels, memory)
    test(`makeDC() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
    })
    res?.gen(params.currentMemAddress)
    test(`Label "${params.tokens.label}" should be loaded address`, () => {
      expect(memory.lookup(getLabelOrThrow(params.tokens.label, labels).memAddress)).toEqual(expected.value1)
      if (expected.value2 != null) {
        expect(memory.lookup(getLabelOrThrow(params.tokens.label, labels).memAddress + 1)).toEqual(expected.value2)
      }
      if (expected.value3 != null) {
        expect(memory.lookup(getLabelOrThrow(params.tokens.label, labels).memAddress + 2)).toEqual(expected.value3)
      }
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
