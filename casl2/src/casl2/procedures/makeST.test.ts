import { Memory } from "../../infra/memory"
import { Label, Tokens } from "../types"
import { makeST } from "./makeST"
import { GeneralRegister } from "./registerAccessor"

describe(`makeST`, () => {
  describe.each([
    {
        tokens: create({ label: "AA", operator: "ST", operand: "GR1,5000" }),
        expected: { wordLength: 2, bytecode: [0x11, 0x10, 5000], stored_mem_address: 5000 }
    },
    {
        tokens: create({ label: "AA", operator: "ST", operand: "GR1,5000,GR3" }),
        expected: { wordLength: 2, bytecode: [0x11, 0x13, 5000], stored_mem_address: 5002 }
    },
    {
        tokens: create({ label: "AA", operator: "ST", operand: "GR1,#1388,GR3" }),
        expected: { wordLength: 2, bytecode: [0x11, 0x13, 5000], stored_mem_address: 5002 }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR1")?.store(123)
    grMap.get("GR3")?.store(2)
    const memory = new Memory()
    memory.store(5000, 0)

    const res = makeST(tokens, labels, grMap, memory)
    test(`makeST() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen()!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen()!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      expect(new DataView(res?.gen()!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
    })

    res?.gen()!.proc(new GeneralRegister("PR"))
    test(`memory should be stored data`, () => {
      expect(memory.lookup(expected.stored_mem_address)).toEqual(123)
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
