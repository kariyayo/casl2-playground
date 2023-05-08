import { Memory } from "../../infra/memory"
import { Interpreter } from "../../interpreter/interpreter"
import { Label, Tokens } from "../types"
import { makeCALL } from "./makeCALL"
import { FlagRegister, GeneralRegister } from "./registerAccessor"

describe(`makeCALL`, () => {
  describe.each([
    {
        tokens: create({ label: "AA", operator: "CALL", operand: "5000" }),
        expected: { wordLength: 2, bytecode: [0x80, 0x00, 5000], changedPR: 5000 }
    },
    {
        tokens: create({ label: "AA", operator: "CALL", operand: "5000,GR3" }),
        expected: { wordLength: 2, bytecode: [0x80, 0x03, 5000], changedPR: 5002 }
    },
    {
        tokens: create({ label: "AA", operator: "CALL", operand: "#1388,GR3" }),
        expected: { wordLength: 2, bytecode: [0x80, 0x03, 5000], changedPR: 5002 }
    },
    {
        tokens: create({ label: "AA", operator: "CALL", operand: "AA" }),
        expected: { wordLength: 2, bytecode: [0x80, 0x00, 2000], changedPR: 2000 }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR3")?.store(2)
    const flagRegister = new FlagRegister()

    const memory = new Memory()

    const SP = new GeneralRegister("SP")
    SP.storeLogical(0x9000)

    // when, then
    const res = makeCALL(tokens)
    test(`makeCALL() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen(grMap, memory, labels)!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen(grMap, memory, labels)!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      expect(new DataView(res?.gen(grMap, memory, labels)!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
    })

    // given
    const PR = new GeneralRegister("PR")
    PR.storeLogical(0x2000)

    // when
    const bytecode = res?.gen(grMap, memory, labels)!.bytecode
    memory.storeBytecode(bytecode, PR.lookupLogical())
    const interpreter = new Interpreter(grMap, flagRegister, PR, SP, memory)
    // then
    interpreter.step()

    // then
    test(`SP is decremented`, () => {
      expect(SP.lookupLogical()).toEqual(0x8FFF)
    })
    test(`memory(SP) should be loaded PR before change`, () => {
      expect(memory.lookupLogical(SP.lookupLogical())).toEqual(0x2002)
    })
    test(`PR is changed`, () => {
      expect(PR.lookupLogical()).toEqual(expected.changedPR)
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
