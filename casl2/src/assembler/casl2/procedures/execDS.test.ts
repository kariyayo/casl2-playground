import { Label } from "../../types"
import { execDS } from "./execDS"

describe(`execDS`, () => {
  describe(`holds 3 words`, () => {
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})

    const tokens = { lineNum: 0, instructionNum: 2, label: "", operator: "DS", operand: "3" }

    const res = execDS(tokens)
    test(``, () => {
      expect(res?.wordLength).toEqual(3)
    })
  })

  describe(`throw error, because operand is not number`, () => {
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})

    const tokens = { lineNum: 0, instructionNum: 2, label: "", operator: "DS", operand: "hoge" }

    test(``, () => {
      expect(() => execDS(tokens).gen(labels)).toThrow()
    })
  })
})
