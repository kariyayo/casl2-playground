import { Memory } from "../../infra/memory"
import { Label, Tokens } from "../types"
import { makeJNZ } from "./makeJNZ"
import { getGrOrThrow, GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeJNZ`, () => {

  describe.each([
    {
        params: { frZero: false, tokens: create({ label: "BB", operator: "JNZ", operand: "500" })},
        expected: { wordLength: 2, bytecode: [0x62, 0x00, 500], PR: 500 }
    },
    {
        params: { frZero: true, tokens: create({ label: "BB", operator: "JNZ", operand: "500" })},
        expected: { wordLength: 2, bytecode: [0x62, 0x00, 500], PR: 2 }
    },
    {
        params: { frZero: false, tokens: create({ label: "BB", operator: "JNZ", operand: "AA,GR3" })},
        expected: { wordLength: 2, bytecode: [0x62, 0x03, 500], PR: 520 }
    },
    {
        params: { frZero: true, tokens: create({ label: "BB", operator: "JNZ", operand: "500,GR3" })},
        expected: { wordLength: 2, bytecode: [0x62, 0x03, 500], PR: 2 }
    },
  ])(`$# :: $params`, ({params, expected}) => {
    // given
    const flagRegister = new FlagRegister()
    flagRegister.zeroFlag = params.frZero

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
    const PR = new GeneralRegister("PR")

    // when, then

    const res = makeJNZ(params.tokens)
    test(`makeJNZ returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      expect(new DataView(res?.gen(grMap, flagRegister, SP, memory, labels)!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
    })
    res?.gen(grMap, flagRegister, SP, memory, labels)!.proc(PR)
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
