import { Memory } from "../../infra/memory"
import { Label } from "../types"
import { makeLD } from "./makeLD"
import { GeneralRegister } from "./registerAccessor"

describe(`makeLD`, () => {
  const tokens = {
    lineNum: 1,
    instructionNum: 4,
    label: "AA",
    operator: "LD",
    operand: "GR1,#5000",
  }
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 2000})
  const grMap = new Map<string, GeneralRegister>()
  for (let i = 0; i <= 7; i++) {
    grMap.set(`GR${i}`, new GeneralRegister())
  }
  const memory = new Memory()
  memory.store(5000, 123)

  const res = makeLD(tokens, labels, grMap, memory)
  test(`makeLD() returns function`, () => {
    expect(res).not.toBeNull()
  })

  res?.proc()
  test(`GR1 should be loaded data`, () => {
    expect(grMap.get("GR1")?.lookup()).toEqual(123)
  })
})
