import { Memory } from "../../infra/memory"
import { Interpreter } from "../../interpreter/interpreter"
import { Label, Tokens } from "../types"
import { makeSUBL } from "./makeSUBL"
import { getGrOrThrow, GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeSUBL`, () => {
  describe.each([
    {
        tokens: create({operator: "SUBL", operand: "GR1,GR2"}),
        expected: { wordLength: 1, bytecode: [0x27, 0x12], GR1: -100, FR: "110"}
    },
    {
        tokens: create({ operator: "SUBL", operand: "GR1,AA" }),
        expected: { wordLength: 2, bytecode: [0x23, 0x10, 1000], GR1: 80, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBL", operand: "GR1,1000" }),
        expected: { wordLength: 2, bytecode: [0x23, 0x10, 1000], GR1: 80, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBL", operand: "GR1,1016" }),
        expected: { wordLength: 2, bytecode: [0x23, 0x10, 1016], GR1: 70, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBL", operand: "GR1,AA,GR3" }),
        expected: { wordLength: 2, bytecode: [0x23, 0x13, 1000], GR1: 70, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBL", operand: "GR1,1000,GR3" }),
        expected: { wordLength: 2, bytecode: [0x23, 0x13, 1000], GR1: 70, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBL", operand: "GR1,984,GR3" }),
        expected: { wordLength: 2, bytecode: [0x23, 0x13, 984], GR1: 80, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBL", operand: "GR4,GR5" }),
        expected: { wordLength: 1, bytecode:[0x27, 0x45], GR1: 100, FR: "001"}
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 1000})

    const flagRegister = new FlagRegister()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    getGrOrThrow("GR1", grMap).store(100)
    getGrOrThrow("GR2", grMap).store(200)
    getGrOrThrow("GR3", grMap).store(16)
    const SP = new GeneralRegister("SP")
    const memory = new Memory()
    memory.store(1000, 20)
    memory.store(1016, 30)

    // when, then
    const res = makeSUBL(tokens)
    test(`makeSUBL returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      if (expected.wordLength == 2) {
        expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
      }
    })

    // given
    const PR = new GeneralRegister("PR")
    PR.storeLogical(0)

    // when
    const bytecode = res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode
    const interpreter = new Interpreter(grMap, flagRegister, PR, SP, memory, bytecode)
    interpreter.step()

    // then
    test(`GR1 should be added value`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected.GR1)
    })
    test(`FR should be applied`, () => {
      expect(flagRegister.toString()).toEqual(expected.FR)
    })
  })

  describe.each([
    {
      name: "SUBL GR,GR -> 32767",
      tokens: create({ operator: "SUBL", operand: "GR3,GR2" }),
      expected: { wordLength: 1, bytecode:[0x27, 0x32], GR3: 32767, FR: "000"}
    },
    {
      name: "SUBL GR,memAddress -> 32767",
      tokens: create({ operator: "SUBL", operand: "GR3,AA" }),
      expected: { wordLength: 2, bytecode:[0x23, 0x30, 1000], GR3: 32767, FR: "000"}
    },
    {
      name: "SUBL GR,GR -> 32768",
      tokens: create({ operator: "SUBL", operand: "GR3,GR1" }),
      expected: { wordLength: 1, bytecode:[0x27, 0x31], GR3: 32768, FR: "010"}
    },
    {
      name: "SUBL GR,memAddress -> 32768",
      tokens: create({ operator: "SUBL", operand: "GR3,BB" }),
      expected: { wordLength: 2, bytecode:[0x23, 0x30, 1016], GR3: 32768, FR: "010"}
    },
  ])(`$# :: $name`, ({name, tokens, expected}) => {
    // given
    const flagRegister = new FlagRegister()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    getGrOrThrow("GR1", grMap).store(1)
    getGrOrThrow("GR2", grMap).store(2)
    getGrOrThrow("GR3", grMap).store(32769)
    const SP = new GeneralRegister("SP")

    const labels = new Map<string, Label>()
    const memory = new Memory()
    labels.set("AA", {label: "AA", memAddress: 1000})
    memory.store(1000, 2)
    labels.set("BB", {label: "BB", memAddress: 1016})
    memory.store(1016, 1)

    // when, then
    const res = makeSUBL(tokens)
    test(`makeSUBL returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      if (expected.wordLength == 2) {
        expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
      }
    })

    // given
    const PR = new GeneralRegister("PR")
    PR.storeLogical(0)

    // when
    const bytecode = res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode
    const interpreter = new Interpreter(grMap, flagRegister, PR, SP, memory, bytecode)
    interpreter.step()

    // then
    test(`GR1 should be subtracted value`, () => {
      expect(grMap.get("GR3")?.lookupLogical()).toEqual(expected.GR3)
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
