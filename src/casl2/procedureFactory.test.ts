import { Label, makeProcedure } from "./procedureFactory"
import { Memory } from "../infra/memory"
import { Register } from "../infra/register"

describe(`makeLD`, () => {
  const tokens = {
    label: "AA",
    operator: "LD",
    operand: "GR1,#5000",
  }
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 2000})
  const grMap = new Map<string, Register>()
  for (let i = 0; i <= 7; i++) {
    grMap.set(`GR${i}`, new Register())
  }
  const memory = new Memory()
  memory.store(5000, 123)

  const res = makeProcedure(tokens, labels, grMap, memory)
  test(`makeProcedure() returns function`, () => {
    expect(res).not.toBeNull()
  })


  res?.proc()
  test(`GR1 should be loaded data`, () => {
    expect(grMap.get("GR1")?.lookup()).toEqual(123)
  })
})