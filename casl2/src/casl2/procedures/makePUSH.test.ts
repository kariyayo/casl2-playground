import { Memory } from "../../infra/memory"
import { Tokens } from "../types"
import { makePUSH } from "./makePUSH"
import { GeneralRegister } from "./registerAccessor"

describe(`makePUSH`, () => {
  describe.each([
    {
        tokens: create({ label: "AA", operator: "PUSH", operand: "5000" }),
        expected: { wordLength: 2, bytecode: [0x70, 0x00, 5000], value: 5000 }
    },
    {
        tokens: create({ label: "AA", operator: "PUSH", operand: "5000,GR3" }),
        expected: { wordLength: 2, bytecode: [0x70, 0x03, 5000], value: 5002 }
    },
    {
        tokens: create({ label: "AA", operator: "PUSH", operand: "#1388,GR3" }),
        expected: { wordLength: 2, bytecode: [0x70, 0x03, 5000], value: 5002 }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR3")?.store(2)

    const memory = new Memory()
    memory.store(5000, 123)

    const SP = new GeneralRegister("SP")
    SP.store(0x9000)

    const res = makePUSH(tokens, grMap, SP)
    test(`makePUSH() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen(memory)!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen(memory)!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      expect(new DataView(res?.gen(memory)!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
    })

    res?.gen(memory)!.proc(new GeneralRegister("PR"))
    test(`SP was decremented`, () => {
      expect(SP.lookupLogical()).toEqual(0x8FFF)
    })
    test(`memory(SP) should be loaded data`, () => {
      expect(memory.lookupLogical(SP.lookupLogical())).toEqual(expected.value)
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
