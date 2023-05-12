import { Memory } from "../../../infra/memory"
import { Interpreter } from "../../../interpreter/interpreter"
import { Label, Tokens } from "../../types"
import { makeJMI } from "./makeJMI"
import { getGrOrThrow, GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeJMI`, () => {

  describe.each([
    {
        params: { frNegative: false, tokens: create({ label: "BB", operator: "JMI", operand: "500" })},
        expected: { wordLength: 2, bytecode: [0x61, 0x00, 500], PR: 2 }
    },
    {
        params: { frNegative: true, tokens: create({ label: "BB", operator: "JMI", operand: "500" })},
        expected: { wordLength: 2, bytecode: [0x61, 0x00, 500], PR: 500 }
    },
    {
        params: { frNegative: false, tokens: create({ label: "BB", operator: "JMI", operand: "AA,GR3" })},
        expected: { wordLength: 2, bytecode: [0x61, 0x03, 500], PR: 2 }
    },
    {
        params: { frNegative: true, tokens: create({ label: "BB", operator: "JMI", operand: "500,GR3" })},
        expected: { wordLength: 2, bytecode: [0x61, 0x03, 500], PR: 520 }
    },
  ])(`$# :: $params`, ({params, expected}) => {
    // given
    const flagRegister = new FlagRegister()
    flagRegister.signFlag = params.frNegative

    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 500})
    const memory = new Memory()

    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    getGrOrThrow("GR3", grMap).store(20)
    const SP = new GeneralRegister("SP")

    // when, then
    const res = makeJMI(params.tokens)
    test(`makeJMI returns Instruction`, () => {
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
    test(`PR should be stored`, () => {
      expect(PR.lookup()).toEqual(expected.PR)
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
