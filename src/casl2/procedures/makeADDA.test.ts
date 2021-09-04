import { Memory } from "../../infra/memory"
import { Label } from "../types"
import { makeADDA } from "./makeADDA"
import { getGrOrThrow, Register } from "./registerAccessor"

describe(`makeADDA`, () => {
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 1000})

  describe.each([
    { tokens: { label: "", operator: "ADDA", operand: "GR1,GR2" }, expected: 300},
    { tokens: { label: "", operator: "ADDA", operand: "GR1,AA" }, expected: 120},
    { tokens: { label: "", operator: "ADDA", operand: "GR1,1000" }, expected: 120},
    { tokens: { label: "", operator: "ADDA", operand: "GR1,1016" }, expected: 100},
    { tokens: { label: "", operator: "ADDA", operand: "GR1,984,GR3" }, expected: 120},
    { tokens: { label: "", operator: "ADDA", operand: "GR1,1000,GR3" }, expected: 100},
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const grMap = new Map<string, Register>()
    for (let i = 0; i <= 7; i++) {
      grMap.set(`GR${i}`, new Register())
    }
    getGrOrThrow("GR1", grMap).store(100)
    getGrOrThrow("GR2", grMap).store(200)
    getGrOrThrow("GR3", grMap).store(16)
    const memory = new Memory()
    memory.store(1000, 20)

    // when, then

    const res = makeADDA(tokens, labels, grMap, memory)
    test(`makeADDA returns function`, () => {
      expect(res).not.toBeNull()
    })
    res?.proc()
    test(`GR1 should be added value`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected)
    })
  })
})
