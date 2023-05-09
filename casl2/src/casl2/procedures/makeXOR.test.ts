import { Memory } from "../../infra/memory"
import { Interpreter } from "../../interpreter/interpreter"
import { Label, Tokens } from "../types"
import { makeXOR } from "./makeXOR"
import { getGrOrThrow, GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeXOR`, () => {
  describe.each([
    {
        tokens: create({operator: "XOR", operand: "GR1,GR2"}),
        expected: { wordLength: 1, bytecode: [0x36, 0x12], GR: 0b0101, FR: "000"}
    },
    {
        tokens: create({ operator: "XOR", operand: "GR1,AA" }),
        expected: { wordLength: 2, bytecode: [0x32, 0x10, 1000], GR: 0b1000, FR: "000" }
    },
    {
        tokens: create({ operator: "XOR", operand: "GR1,1000" }),
        expected: { wordLength: 2, bytecode: [0x32, 0x10, 1000], GR: 0b1000, FR: "000" }
    },
    {
        tokens: create({ operator: "XOR", operand: "GR1,AA,GR3" }),
        expected: { wordLength: 2, bytecode: [0x32, 0x13, 1000], GR: 0b1000, FR: "000" }
    },
    {
        tokens: create({ operator: "XOR", operand: "GR1,1000,GR3" }),
        expected: { wordLength: 2, bytecode: [0x32, 0x13, 1000], GR: 0b1000, FR: "000" }
    },
    {
        tokens: create({ operator: "XOR", operand: "GR4,GR5" }),
        expected: { wordLength: 1, bytecode:[0x36, 0x45], GR: 0b0011, FR: "001"}
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const flagRegister = new FlagRegister()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    getGrOrThrow("GR1", grMap).store(0b0011)
    getGrOrThrow("GR2", grMap).store(0b0110)
    const SP = new GeneralRegister("SP")
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 1000})
    const memory = new Memory()
    memory.store(1000, 0b1011)
    memory.store(1016, 30)

    // when, then
    const res = makeXOR(tokens)
    test(`makeXOR returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      const bytecodeView = new DataView(res?.gen(grMap, labels)!.bytecode)
      expect(bytecodeView.getUint8(0)).toEqual(expected.bytecode[0])
      expect(bytecodeView.getUint8(1)).toEqual(expected.bytecode[1])
      if (expected.wordLength == 2) {
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
    test(`GR1 should be applied`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected.GR)
    })
    test(`FR should be applied`, () => {
      expect(flagRegister.toString()).toEqual(expected.FR)
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
