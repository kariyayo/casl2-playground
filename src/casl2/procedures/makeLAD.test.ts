import { Memory } from "../../infra/memory"
import { Label, Tokens } from "../types"
import { makeLAD } from "./makeLAD"
import { getGrOrThrow, GeneralRegister } from "./registerAccessor"

describe(`makeLAD`, () => {
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 2000})
  const memory = new Memory()

  describe.each([
    {
        tokens: create({ label: "BB", operator: "LAD", operand: "GR1,500" }),
        expected: { wordLength: 2, GR: 500 }
    },
    {
        tokens: create({ label: "BB", operator: "LAD", operand: "GR1,AA" }),
        expected: { wordLength: 2, GR: 2000 }
    },
    {
        tokens: create({ label: "BB", operator: "LAD", operand: "GR1,AA,GR2" }),
        expected: { wordLength: 2, GR: 2200 }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      grMap.set(`GR${i}`, new GeneralRegister())
    }
    getGrOrThrow("GR2", grMap).store(200)

    // when, then

    const res = makeLAD(tokens, labels, grMap, memory)
    test(`makeLAD returns Instruction`, () => {
      expect(res?.proc).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
    })
    res?.proc()
    test(`GR1 should be loaded address`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected.GR)
    })
  })

  describe.each([
    { tokens: create({ label: "BB", operator: "LAD", operand: "GR1,AA," })},
    { tokens: create({ label: "BB", operator: "LAD", operand: "GR1,AA,20" })},
    { tokens: create({ label: "BB", operator: "LAD", operand: "GR1" })},
  ])(`$# :: $tokens`, ({tokens}) => {
    // given
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      grMap.set(`GR${i}`, new GeneralRegister())
    }
    getGrOrThrow("GR2", grMap).store(200)

    // when, then
    test(`makeLAD throw Error`, () => {
      expect(() => makeLAD(tokens, labels, grMap, memory)).toThrow()
    })
  })
})

function create(params: {
  lineNum?: number,
  instructionNum?: number,
  label?: string,
  operator: string,
  operand: string
}): Tokens {
  let { lineNum, instructionNum, label, operator, operand } = params
  lineNum = lineNum || 0
  instructionNum = instructionNum || 0
  label = label || ""
  return { lineNum, instructionNum, label, operator, operand }
}
