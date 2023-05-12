import { Memory } from "../../../infra/memory"
import { Interpreter } from "../../../interpreter/interpreter"
import { Label, Tokens } from "../../types"
import { makeLD } from "./makeLD"
import { FlagRegister, GeneralRegister } from "./registerAccessor"

describe(`makeLD`, () => {
  describe.each([
    {
        tokens: create({ label: "AA", operator: "LD", operand: "GR1,A5000" }),
        expected: { wordLength: 2, bytecode: [0x10, 0x10, 5000], GR1_value: 123 }
    },
    {
        tokens: create({ label: "AA", operator: "LD", operand: "GR1,5000,GR3" }),
        expected: { wordLength: 2, bytecode: [0x10, 0x13, 5000], GR1_value: 234 }
    },
    {
        tokens: create({ label: "AA", operator: "LD", operand: "GR1,#1388,GR3" }),
        expected: { wordLength: 2, bytecode: [0x10, 0x13, 5000], GR1_value: 234 }
    },
    {
        tokens: create({ label: "AA", operator: "LD", operand: "GR1,GR2" }),
        expected: { wordLength: 1, bytecode: [0x14, 0x12], GR1_value: 345 }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const labels = new Map<string, Label>()
    labels.set("A5000", {label: "A5000", memAddress: 5000})
    const flagRegister = new FlagRegister()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR3")?.store(2)
    const memory = new Memory()
    memory.store(5000, 123)
    grMap.get("GR2")?.store(345)
    memory.store(5000 + (grMap.get("GR3")?.lookup() || 0), 234)
    const SP = new GeneralRegister("SP")

    // when, then
    const res = makeLD(tokens)
    test(`makeLD() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      const bytecodeView = new DataView(res?.gen(grMap, labels)!.bytecode)
      expect(bytecodeView.getUint8(0)).toEqual(expected.bytecode[0])
      expect(bytecodeView.getUint8(1)).toEqual(expected.bytecode[1])
      if (expected.wordLength > 1) {
        expect(bytecodeView.getUint16(2)).toEqual(expected.bytecode[2])
      }
    })

    // given
    const PR = new GeneralRegister("PR")
    PR.storeLogical(0)

    // when
    const bytecode = res?.gen(grMap, labels)!.bytecode
    memory.storeBytecode(bytecode, 0)
    const interpreter = new Interpreter(grMap, flagRegister, PR, SP, memory)
    interpreter.step()

    // then
    test(`GR1 should be loaded data`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected.GR1_value)
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
