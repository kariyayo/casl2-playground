import { Memory } from "../../../infra/memory"
import { Interpreter } from "../../../interpreter/interpreter"
import { Label, Tokens } from "../../types"
import { makeSRA } from "./makeSRA"
import { getGrOrThrow, GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeSRA`, () => {

  describe.each([
    {
        tokens: create({ operator: "SRA", operand: "GR1,2" }),
        expected: { wordLength: 2, bytecode: [0x51, 0x10, 2], afterGR1: 0b0001, FR: "000" }
    },
    {
        tokens: create({ operator: "SRA", operand: "GR1,3" }),
        expected: { wordLength: 2, bytecode: [0x51, 0x10, 3], afterGR1: 0b0000, FR: "101" }
    },
    {
        tokens: create({ operator: "SRA", operand: "GR1,1,GR3" }),
        expected: { wordLength: 2, bytecode: [0x51, 0x13, 1], afterGR1: 0b0001, FR: "000" }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const flagRegister = new FlagRegister()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    getGrOrThrow("GR1", grMap).store(0b0100)
    getGrOrThrow("GR3", grMap).store(1)
    const SP = new GeneralRegister("SP")
    const labels = new Map<string, Label>()
    const memory = new Memory()

    // when, then
    const res = makeSRA(tokens)
    test(`makeSRA returns Instruction`, () => {
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
    test(`GR1 should be added value`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected.afterGR1)
    })
    test(`FR should be applied`, () => {
      expect(flagRegister.toString()).toEqual(expected.FR)
    })
  })

  describe.each([
    {
        beforeGR2: 0b1111000000000000,
        tokens: create({ operator: "SRA", operand: "GR2,1" }),
        expected: { bytecode: [0x51, 0x20, 1], afterGR2: -2048, FR: "010" }
    },
    {
        beforeGR2: 0b0111000000000001,
        tokens: create({ operator: "SRA", operand: "GR2,1" }),
        expected: { bytecode: [0x51, 0x20, 1], afterGR2: 0b0011100000000000, FR: "100" }
    },
  ])(`$# :: $tokens`, ({tokens, beforeGR2, expected}) => {
    // given
    const flagRegister = new FlagRegister()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    getGrOrThrow("GR2", grMap).store(beforeGR2)
    const SP = new GeneralRegister("SP")
    const labels = new Map<string, Label>()
    const memory = new Memory()
    const PR = new GeneralRegister("PR")
    PR.storeLogical(0)

    // when
    const res = makeSRA(tokens)
    const bytecode = res?.gen(grMap, labels)!.bytecode
    memory.storeBytecode(bytecode, 0)
    const interpreter = new Interpreter(grMap, flagRegister, PR, SP, memory)
    interpreter.step()

    // then
    test(`GR2 should be added value`, () => {
      expect(grMap.get("GR2")?.lookup()).toEqual(expected.afterGR2)
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