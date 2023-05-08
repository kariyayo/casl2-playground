import { Memory } from "../../infra/memory"
import { Interpreter } from "../../interpreter/interpreter"
import { Label, Tokens } from "../types"
import { makeRET } from "./makeRET"
import { FlagRegister, GeneralRegister } from "./registerAccessor"

describe(`makeRET`, () => {
  describe.each([
    {
        tokens: create({ label: "AA", operator: "RET" }),
        expected: { wordLength: 1, bytecode: [0x81, 0x00] }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    const flagRegister = new FlagRegister()

    const labels = new Map<string, Label>()
    const memory = new Memory()
    memory.storeLogical(0x8FFF, 0x2000)

    const SP = new GeneralRegister("SP")
    SP.storeLogical(0x8FFF)

    // when, then
    const res = makeRET(tokens)
    test(`makeRET() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
    })

    // given
    const PR = new GeneralRegister("PR")
    PR.storeLogical(0)

    // when
    const bytecode = res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode
    const interpreter = new Interpreter(grMap, flagRegister, PR, SP, memory, bytecode)
    interpreter.step()

    // then
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
