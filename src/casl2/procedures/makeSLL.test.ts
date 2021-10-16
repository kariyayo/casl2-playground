import { Memory } from "../../infra/memory"
import { Label, Tokens } from "../types"
import { makeSLL } from "./makeSLL"
import { getGrOrThrow, GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeSLL`, () => {

  describe.each([
    {
        tokens: create({ operator: "SLL", operand: "GR1,2" }),
        expected: { wordLength: 2, bytecode: [0x52, 0x10, 2], GR: 0b1000, FR: "000" }
    },
    {
        tokens: create({ operator: "SLL", operand: "GR1,1" }),
        expected: { wordLength: 2, bytecode: [0x52, 0x10, 1], GR: 0b0100, FR: "000" }
    },
    {
        tokens: create({ operator: "SLL", operand: "GR1,1,GR3" }),
        expected: { wordLength: 2, bytecode: [0x52, 0x13, 1], GR: 0b1000, FR: "000" }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const flagRegister = new FlagRegister()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    getGrOrThrow("GR1", grMap).store(0b0010)
    getGrOrThrow("GR3", grMap).store(1)
    const labels = new Map<string, Label>()
    const memory = new Memory()

    // when, then

    const res = makeSLL(tokens, labels, flagRegister, grMap, memory)
    test(`makeSLL returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen()!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen()!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      if (expected.wordLength == 2) {
        expect(new DataView(res?.gen()!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
      }
    })
    res?.gen()!.proc(new GeneralRegister("PR"))
    test(`GR1 should be added value`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected.GR)
    })
    test(`FR should be applied`, () => {
      expect(flagRegister.toString()).toEqual(expected.FR)
    })
  })

  describe.each([
    {
        beforeGR2: 0b0111111111111111,
        tokens: create({ operator: "SLL", operand: "GR2,1" }),
        expected: { bytecode: [0x50, 0x20, 1], afterGR2: 0b1111111111111110, FR: "110" }
    },
    {
        beforeGR2: 0b1111000000000000,
        tokens: create({ operator: "SLL", operand: "GR2,1" }),
        expected: { bytecode: [0x50, 0x20, 1], afterGR2: 0b1110000000000000, FR: "110" }
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
    const labels = new Map<string, Label>()
    const memory = new Memory()

    // when, then

    const res = makeSLL(tokens, labels, flagRegister, grMap, memory)
    res?.gen()!.proc(new GeneralRegister("PR"))
    test(`GR2 should be added value`, () => {
      expect(grMap.get("GR2")?.lookupLogical()).toEqual(expected.afterGR2)
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
