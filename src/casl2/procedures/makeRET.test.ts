import { Memory } from "../../infra/memory"
import { Tokens } from "../types"
import { makeRET } from "./makeRET"
import { GeneralRegister } from "./registerAccessor"

describe(`makeRET`, () => {
  describe.each([
    {
        tokens: create({ label: "AA", operator: "RET" }),
        expected: { wordLength: 1, bytecode: [0x81, 0x00] }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }

    const memory = new Memory()
    memory.storeLogical(0x8FFF, 0x2000)

    const SP = new GeneralRegister("SP")
    SP.storeLogical(0x8FFF)

    const res = makeRET(tokens, memory, SP)
    test(`makeRET() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen()!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen()!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
    })

    const PR = new GeneralRegister("PR")
    res?.gen()!.proc(PR)
    test(`SP is incremented`, () => {
      expect(SP.lookupLogical()).toEqual(0x9000)
    })
    test(`PR is changed`, () => {
      expect(PR.lookupLogical()).toEqual(0x2000)
    })
  })
})

function create(params: {
  lineNum?: number,
  instructionNum?: number,
  label?: string,
  operator: string,
  operand?: string
}): Tokens {
  let { lineNum, instructionNum, label, operator, operand } = params
  lineNum = lineNum || 0
  instructionNum = instructionNum || 0
  label = label || ""
  operand = operand || ""
  return { lineNum, instructionNum, label, operator, operand }
}
