import { Memory } from "../../infra/memory"
import { Label } from "../types"
import { FlagRegister, GeneralRegister } from "./registerAccessor"
import { execDS } from "./execDS"

describe(`execDS`, () => {
  describe(`holds 3 words`, () => {
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})

    const tokens = { lineNum: 0, instructionNum: 2, label: "", operator: "DS", operand: "3" }
    const currentMemAddress = 2001

    // given
    const memory = new Memory()

    // when, then
    const res = execDS(tokens)
    test(``, () => {
      expect(res?.wordLength).toEqual(3)
    })
  })

  describe(`throw error, because operand is not number`, () => {
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})

    const tokens = { lineNum: 0, instructionNum: 2, label: "", operator: "DS", operand: "hoge" }
    const currentMemAddress = 2001

    // given
    const grMap = new Map<string, GeneralRegister>()
    const flagRegister = new FlagRegister()
    const SP = new GeneralRegister("SP")
    const memory = new Memory()

    // when, then
    test(``, () => {
      expect(() => execDS(tokens).gen(grMap, flagRegister, SP, memory, labels)).toThrow()
    })
  })
})
