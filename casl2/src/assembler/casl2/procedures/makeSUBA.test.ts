import { Memory } from "../../../infra/memory"
import { Interpreter } from "../../../interpreter/interpreter"
import { Label, Tokens } from "../../types"
import { makeSUBA } from "./makeSUBA"
import { GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeSUBA`, () => {
  const labels = new Map<string, Label>()
  labels.set("AA", {label: "AA", memAddress: 1000})

  describe.each([
    {
        tokens: create({operator: "SUBA", operand: "GR1,GR2"}),
        expected: { wordLength: 1, bytecode: [0x25, 0x12], GR1: -100, FR: "010"}
    },
    {
        tokens: create({ operator: "SUBA", operand: "GR1,AA" }),
        expected: { wordLength: 2, bytecode: [0x21, 0x10, 1000], GR1: 80, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBA", operand: "GR1,1000" }),
        expected: { wordLength: 2, bytecode: [0x21, 0x10, 1000], GR1: 80, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBA", operand: "GR1,1016" }),
        expected: { wordLength: 2, bytecode: [0x21, 0x10, 1016], GR1: 70, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBA", operand: "GR1,AA,GR3" }),
        expected: { wordLength: 2, bytecode: [0x21, 0x13, 1000], GR1: 70, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBA", operand: "GR1,1000,GR3" }),
        expected: { wordLength: 2, bytecode: [0x21, 0x13, 1000], GR1: 70, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBA", operand: "GR1,984,GR3" }),
        expected: { wordLength: 2, bytecode: [0x21, 0x13, 984], GR1: 80, FR: "000" }
    },
    {
        tokens: create({ operator: "SUBA", operand: "GR4,GR5" }),
        expected: { wordLength: 1, bytecode:[0x25, 0x45], GR1: 100, FR: "001"}
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const flagRegister = new FlagRegister()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR1")?.store(100)
    grMap.get("GR2")?.store(200)
    grMap.get("GR3")?.store(16)
    const SP = new GeneralRegister("SP")
    const memory = new Memory()
    memory.store(1000, 20)
    memory.store(1016, 30)

    // when, then
    const res = makeSUBA(tokens)
    test(`makeSUBA returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      const bytecodeView = new DataView(res?.gen(labels)!.bytecode)
      expect(bytecodeView.getUint8(0)).toEqual(expected.bytecode[0])
      expect(bytecodeView.getUint8(1)).toEqual(expected.bytecode[1])
      if (expected.wordLength == 2) {
        expect(bytecodeView.getUint16(2)).toEqual(expected.bytecode[2])
      }
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
    test(`GR1 should be added value`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(expected.GR1)
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
