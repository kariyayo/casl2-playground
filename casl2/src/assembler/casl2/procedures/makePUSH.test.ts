import { Memory } from "../../../infra/memory"
import { Interpreter } from "../../../interpreter/interpreter"
import { Label, Tokens } from "../../types"
import { makePUSH } from "./makePUSH"
import { FlagRegister, GeneralRegister } from "./registerAccessor"

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
    // given
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR3")?.store(2)

    const labels = new Map<string, Label>()
    const memory = new Memory()
    memory.store(5000, 123)

    const SP = new GeneralRegister("SP")
    SP.store(0x9000)
    const flagRegister = new FlagRegister()

    // when, then
    const res = makePUSH(tokens)
    test(`makePUSH() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      const bytecodeView = new DataView(res?.gen(grMap, labels)!.bytecode)
      expect(bytecodeView.getUint8(0)).toEqual(expected.bytecode[0])
      expect(bytecodeView.getUint8(1)).toEqual(expected.bytecode[1])
      expect(bytecodeView.getUint16(2)).toEqual(expected.bytecode[2])
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
