import { Memory } from "../../infra/memory"
import { Label } from "../types"
import { makeLAD } from "./makeLAD"
import { getGrOrThrow, Register } from "./registerAccessor"

describe(`makeLAD`, () => {
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 2000})
  const memory = new Memory()

  describe.each([
    { tokens: { label: "BB", operator: "LAD", operand: "GR1,500" }, expected: 500},
    { tokens: { label: "BB", operator: "LAD", operand: "GR1,AA" }, expected: 2000},
    { tokens: { label: "BB", operator: "LAD", operand: "GR1,AA,GR2" }, expected: 2200},
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const grMap = new Map<string, Register>()
    for (let i = 0; i <= 7; i++) {
      grMap.set(`GR${i}`, new Register())
    }
    getGrOrThrow("GR2", grMap).store(200)

    // when, then

    const res = makeLAD(tokens, labels, grMap, memory)
    test(`makeLAD returns function`, () => {
      expect(res).not.toBeNull()
    })
    res?.proc()
    test(`GR1 should be loaded address`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected)
    })
  })

  describe.each([
    { tokens: { label: "BB", operator: "LAD", operand: "GR1,AA," }},
    { tokens: { label: "BB", operator: "LAD", operand: "GR1,AA,20" }},
    { tokens: { label: "BB", operator: "LAD", operand: "GR1" }},
  ])(`$# :: $tokens`, ({tokens}) => {
    // given
    const grMap = new Map<string, Register>()
    for (let i = 0; i <= 7; i++) {
      grMap.set(`GR${i}`, new Register())
    }
    getGrOrThrow("GR2", grMap).store(200)

    // when, then
    test(`makeLAD throw Error`, () => {
      expect(() => makeLAD(tokens, labels, grMap, memory)).toThrow()
    })
  })
})
