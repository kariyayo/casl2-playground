import { Memory } from "../../infra/memory"
import { Interpreter } from "../../interpreter/interpreter"
import { Label, Tokens } from "../types"
import { makeADDL } from "./makeADDL"
import { getGrOrThrow, GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeADDL`, () => {
  describe.each([
    {
        tokens: create({operator: "ADDL", operand: "GR1,GR2"}),
        expected: { wordLength: 1, bytecode: [0x26, 0x12], GR: 300, FR: "000"}
    },
    {
        tokens: create({ operator: "ADDL", operand: "GR1,AA" }),
        expected: { wordLength: 2, bytecode: [0x22, 0x10, 1000], GR: 120, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDL", operand: "GR1,1000" }),
        expected: { wordLength: 2, bytecode: [0x22, 0x10, 1000], GR: 120, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDL", operand: "GR1,1016" }),
        expected: { wordLength: 2, bytecode: [0x22, 0x10, 1016], GR: 130, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDL", operand: "GR1,AA,GR3" }),
        expected: { wordLength: 2, bytecode: [0x22, 0x13, 1000], GR: 130, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDL", operand: "GR1,1000,GR3" }),
        expected: { wordLength: 2, bytecode: [0x22, 0x13, 1000], GR: 130, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDL", operand: "GR1,984,GR3" }),
        expected: { wordLength: 2, bytecode: [0x22, 0x13, 984], GR: 120, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDL", operand: "GR4,GR5" }),
        expected: { wordLength: 1, bytecode:[0x26, 0x45], GR: 100, FR: "001"}
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
    const res = makeADDL(tokens)
    test(`makeADDL returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      const bytecode = res?.gen(grMap, labels)!.bytecode
      expect(new DataView(bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      if (expected.wordLength == 2) {
        expect(new DataView(bytecode).getUint16(2)).toEqual(expected.bytecode[2])
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
      expect(grMap.get("GR1")?.lookup()).toEqual(expected.GR)
    })
    test(`FR should be applied`, () => {
      expect(flagRegister.toString()).toEqual(expected.FR)
    })
  })

  describe.each([
    {
      name: "ADDL GR,GR -> 32767",
      tokens: create({ operator: "ADDL", operand: "GR1,GR2" }),
      expected: { wordLength: 1, bytecode:[0x26, 0x12], GR1: 32767, FR: "000"}
    },
    {
      name: "ADDL GR,memAddress -> 32767",
      tokens: create({ operator: "ADDL", operand: "GR1,AA" }),
      expected: { wordLength: 2, bytecode:[0x22, 0x10, 1000], GR1: 32767, FR: "000"}
    },
    {
      name: "ADDL GR,GR -> 32768",
      tokens: create({ operator: "ADDL", operand: "GR1,GR3" }),
      expected: { wordLength: 1, bytecode:[0x26, 0x13], GR1: 32768, FR: "010"}
    },
    {
      name: "ADDL GR,memAddress -> 32768",
      tokens: create({ operator: "ADDL", operand: "GR1,BB" }),
      expected: { wordLength: 2, bytecode:[0x22, 0x10, 1016], GR1: 32768, FR: "010"}
    },
    {
      name: "ADDL GR,GR -> 65536",
      tokens: create({ operator: "ADDL", operand: "GR1,GR4" }),
      expected: { wordLength: 1, bytecode:[0x26, 0x14], GR1: 0, FR: "101"}
    },
    {
      name: "ADDL GR,memAddress -> 65536",
      tokens: create({ operator: "ADDL", operand: "GR1,CC" }),
      expected: { wordLength: 2, bytecode:[0x22, 0x10, 1020], GR1: 0, FR: "101"}
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
    getGrOrThrow("GR2", grMap).store(32768 - 2)
    getGrOrThrow("GR3", grMap).store(32768 - 1)
    getGrOrThrow("GR4", grMap).storeLogical(65536 - 1)
    const SP = new GeneralRegister("SP")

    const labels = new Map<string, Label>()
    const memory = new Memory()
    labels.set("AA", {label: "AA", memAddress: 1000})
    memory.store(1000, 32768 - 2)
    labels.set("BB", {label: "BB", memAddress: 1016})
    memory.store(1016, 32768 - 1)
    labels.set("CC", {label: "CC", memAddress: 1020})
    memory.storeLogical(1020, 65536 - 1)

    // when, then
    const res = makeADDL(tokens)
    test(`makeADDL returns Instruction`, () => {
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
    new Interpreter(grMap, flagRegister, PR, SP, memory).step()

    // then
    test(`GR1 should be added value`, () => {
      expect(grMap.get("GR1")?.lookupLogical()).toEqual(expected.GR1)
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
