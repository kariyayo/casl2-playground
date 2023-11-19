import { Memory } from "../../../infra/memory"
import { Interpreter } from "../../../interpreter/interpreter"
import { Label, Tokens } from "../../types"
import { makePOP } from "./makePOP"
import { FlagRegister, GeneralRegister } from "./registerAccessor"

describe(`makePOP`, () => {
  describe.each([
    {
        tokens: create({ label: "AA", operator: "POP", operand: "GR1" }),
        expected: { wordLength: 1, bytecode: [0x71, 0x10], targetGR: "GR1", value: 5000 }
    },
    {
        tokens: create({ label: "AA", operator: "POP", operand: "GR3" }),
        expected: { wordLength: 1, bytecode: [0x71, 0x30], targetGR: "GR3", value: 5000 }
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
    memory.storeLogical(0x8FFF, 5000)

    const SP = new GeneralRegister("SP")
    SP.store(0x8FFF)

    // when, then
    const res = makePOP(tokens)
    test(`makePOP() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      const bytecodeView = new DataView(res?.gen(labels)!.bytecode)
      expect(bytecodeView.getUint8(0)).toEqual(expected.bytecode[0])
      expect(bytecodeView.getUint8(1)).toEqual(expected.bytecode[1])
    })

    // given
    const PR = new GeneralRegister("PR")
    PR.storeLogical(0)

    // when
    const bytecode = res?.gen(labels)!.bytecode
    memory.storeBytecode(bytecode, 0)
    const interpreter = new Interpreter(grMap, flagRegister, PR, SP, memory)
    interpreter.step()

    // then
    test(`SP was incremented`, () => {
      expect(SP.lookupLogical()).toEqual(0x9000)
    })
    test(`target GR should be loaded data`, () => {
      var GR = grMap.get(expected.targetGR)
      expect(GR?.lookupLogical()).toEqual(expected.value)
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
