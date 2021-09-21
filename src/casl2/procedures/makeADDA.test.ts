import { Memory } from "../../infra/memory"
import { Label, Tokens } from "../types"
import { makeADDA } from "./makeADDA"
import { getGrOrThrow, GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeADDA`, () => {
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 1000})

  describe.each([
    {
        tokens: create({operator: "ADDA", operand: "GR1,GR2"}),
        expected: { wordLength: 1, bytecode: [0x24, 0x12], GR: 300, FR: "000"}
    },
    {
        tokens: create({ operator: "ADDA", operand: "GR1,AA" }),
        expected: { wordLength: 2, bytecode: [0x20, 0x10, 1000], GR: 120, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDA", operand: "GR1,1000" }),
        expected: { wordLength: 2, bytecode: [0x20, 0x10, 1000], GR: 120, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDA", operand: "GR1,1016" }),
        expected: { wordLength: 2, bytecode: [0x20, 0x10, 1016], GR: 100, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDA", operand: "GR1,984,GR3" }),
        expected: { wordLength: 2, bytecode: [0x20, 0x13, 1000], GR: 120, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDA", operand: "GR1,1000,GR3" }),
        expected: { wordLength: 2, bytecode: [0x20, 0x13, 1016], GR: 100, FR: "000" }
    },
    {
        tokens: create({ operator: "ADDA", operand: "GR4,GR5" }),
        expected: { wordLength: 1, bytecode:[0x24, 0x45], GR: 100, FR: "001"}
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const flagRegister = new FlagRegister()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    getGrOrThrow("GR1", grMap).store(100)
    getGrOrThrow("GR2", grMap).store(200)
    getGrOrThrow("GR3", grMap).store(16)
    const memory = new Memory()
    memory.store(1000, 20)

    // when, then

    const res = makeADDA(tokens, labels, flagRegister, grMap, memory)
    test(`makeADDA returns Instruction`, () => {
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
