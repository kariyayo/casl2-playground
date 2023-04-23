import { Memory } from "../../infra/memory"
import { Label, Tokens } from "../types"
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

    const res = makeLD(tokens)
    test(`makeLD() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      if (expected.wordLength > 1) {
        expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
      }
    })

    res?.gen(grMap, flagRegister, SP, memory, labels)!.proc(new GeneralRegister("PR"))
    test(`GR1 should be loaded data`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected.GR1_value)
    })
  })
  // describe(`GR <- memory`, () => {
  //   const tokens = {
  //     lineNum: 1,
  //     instructionNum: 4,
  //     label: "AA",
  //     operator: "LD",
  //     operand: "GR1,A5000",
  //   }
  //   const labels = new Map<string, Label>()
  //   labels.set("A5000", {label: "A5000", memAddress: 5000})
  //   const flagRegister = new FlagRegister()
  //   const grMap = new Map<string, GeneralRegister>()
  //   for (let i = 0; i <= 7; i++) {
  //     const name = `GR${i}`
  //     grMap.set(name, new GeneralRegister(name))
  //   }
  //   const memory = new Memory()
  //   memory.store(5000, 123)

  //   const res = makeLD(tokens, labels, flagRegister, grMap, memory)
  //   test(`makeLD() returns Instruction`, () => {
  //     expect(res?.gen).not.toBeNull()
  //     expect(res?.wordLength).toBe(2)
  //     expect(new DataView(res?.gen()!.bytecode).getUint8(0)).toEqual(0x10)
  //     expect(new DataView(res?.gen()!.bytecode).getUint8(1)).toEqual(0x10)
  //     expect(new DataView(res?.gen()!.bytecode).getUint16(2)).toEqual(5000)
  //   })

  //   res?.gen()!.proc(new GeneralRegister("PR"))
  //   test(`GR1 should be loaded data`, () => {
  //     expect(grMap.get("GR1")?.lookup()).toEqual(123)
  //   })
  // })

  // describe(`GR <- memory+GRx`, () => {
  //   const tokens = {
  //     lineNum: 1,
  //     instructionNum: 4,
  //     label: "AA",
  //     operator: "LD",
  //     operand: "GR1,#5000,GR3",
  //   }
  //   const labels = new Map<string, Label>()
  //   labels.set("AA", {label: "AA", memAddress: 2000})
  //   const flagRegister = new FlagRegister()
  //   const grMap = new Map<string, GeneralRegister>()
  //   for (let i = 0; i <= 7; i++) {
  //     const name = `GR${i}`
  //     grMap.set(name, new GeneralRegister(name))
  //   }
  //   grMap.get("GR3")?.store(2)
  //   const memory = new Memory()
  //   memory.store(5000 + (grMap.get("GR3")?.lookup() || 0), 123)

  //   const res = makeLD(tokens, labels, flagRegister, grMap, memory)
  //   test(`makeLD() returns Instruction`, () => {
  //     expect(res?.gen).not.toBeNull()
  //     expect(res?.wordLength).toBe(2)
  //     expect(new DataView(res?.gen()!.bytecode).getUint8(0)).toEqual(0x10)
  //     expect(new DataView(res?.gen()!.bytecode).getUint8(1)).toEqual(0x13)
  //     expect(new DataView(res?.gen()!.bytecode).getUint16(2)).toEqual(5000)
  //   })

  //   res?.gen()!.proc(new GeneralRegister("PR"))
  //   test(`GR1 should be loaded data`, () => {
  //     expect(grMap.get("GR1")?.lookup()).toEqual(123)
  //   })
  // })

  // describe(`GR <- GR`, () => {
  //   const tokens = {
  //     lineNum: 1,
  //     instructionNum: 4,
  //     label: "AA",
  //     operator: "LD",
  //     operand: "GR1,GR2",
  //   }
  //   const labels = new Map<string, Label>()
  //   const flagRegister = new FlagRegister()
  //   const grMap = new Map<string, GeneralRegister>()
  //   for (let i = 0; i <= 7; i++) {
  //     const name = `GR${i}`
  //     grMap.set(name, new GeneralRegister(name))
  //   }
  //   grMap.get("GR2")?.store(123)
  //   const memory = new Memory()

  //   const res = makeLD(tokens, labels, flagRegister, grMap, memory)
  //   test(`makeLD() returns Instruction`, () => {
  //     expect(res?.gen).not.toBeNull()
  //     expect(res?.wordLength).toBe(1)
  //     expect(new DataView(res?.gen()!.bytecode).getUint8(0)).toEqual(0x14)
  //     expect(new DataView(res?.gen()!.bytecode).getUint8(1)).toEqual(0x12)
  //   })

  //   res?.gen()!.proc(new GeneralRegister("PR"))
  //   test(`GR1 should be loaded data`, () => {
  //     expect(grMap.get("GR1")?.lookup()).toEqual(123)
  //   })
  // })

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
