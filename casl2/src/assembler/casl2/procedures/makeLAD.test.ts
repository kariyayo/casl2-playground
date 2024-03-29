import { Memory } from "../../../infra/memory"
import { Interpreter } from "../../../interpreter/interpreter"
import { Label, Tokens } from "../../types"
import { makeLAD } from "./makeLAD"
import { FlagRegister, GeneralRegister } from "./registerAccessor"

describe(`makeLAD`, () => {
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 2000})
  const memory = new Memory()

  describe.each([
    {
        tokens: create({ label: "BB", operator: "LAD", operand: "GR1,500" }),
        expected: { wordLength: 2, bytecode: [0x12, 0x10, 500], GR: 500 }
    },
    {
        tokens: create({ label: "BB", operator: "LAD", operand: "GR1,AA" }),
        expected: { wordLength: 2, bytecode: [0x12, 0x10, 2000], GR: 2000 }
    },
    {
        tokens: create({ label: "BB", operator: "LAD", operand: "GR1,AA,GR2" }),
        expected: { wordLength: 2, bytecode: [0x12, 0x12, 2000], GR: 2200 }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR2")?.store(200)
    const flagRegister = new FlagRegister()
    const SP = new GeneralRegister("SP")

    // when, then
    const res = makeLAD(tokens)
    test(`makeLAD returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      const bytecodeView = new DataView(res?.gen(labels)!.bytecode)
      expect(bytecodeView.getUint8(0)).toEqual(expected.bytecode[0])
      expect(bytecodeView.getUint8(1)).toEqual(expected.bytecode[1])
      expect(bytecodeView.getUint16(2)).toEqual(expected.bytecode[2])
    })

    // given
    const PR = new GeneralRegister("PR")
    PR.storeLogical(0)

    // when
    const bytecode = res?.gen(labels)!.bytecode
    memory.storeBytecode(bytecode, 0)
    const interpreter = new Interpreter(grMap, flagRegister, PR, SP, memory)
    interpreter.step()

    // then
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
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR2")?.store(200)
    const flagRegister = new FlagRegister()
    const SP = new GeneralRegister("SP")

    // when, then
    test(`makeLAD throw Error`, () => {
      expect(() => makeLAD(tokens).gen(labels)).toThrow()
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
