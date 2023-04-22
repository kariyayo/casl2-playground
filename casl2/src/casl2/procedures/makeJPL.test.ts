import { Memory } from "../../infra/memory"
import { Label, Tokens } from "../types"
import { makeJPL } from "./makeJPL"
import { getGrOrThrow, GeneralRegister, FlagRegister } from "./registerAccessor"

describe(`makeJPL`, () => {

  describe.each([
    {
        params: { frNegative: false, tokens: create({ label: "BB", operator: "JPL", operand: "500" })},
        expected: { wordLength: 2, bytecode: [0x65, 0x00, 500], PR: 500 }
    },
    {
        params: { frNegative: true, tokens: create({ label: "BB", operator: "JPL", operand: "500" })},
        expected: { wordLength: 2, bytecode: [0x65, 0x00, 500], PR: 2 }
    },
    {
        params: { frNegative: false, tokens: create({ label: "BB", operator: "JPL", operand: "AA,GR3" })},
        expected: { wordLength: 2, bytecode: [0x65, 0x03, 500], PR: 520 }
    },
    {
        params: { frNegative: true, tokens: create({ label: "BB", operator: "JPL", operand: "500,GR3" })},
        expected: { wordLength: 2, bytecode: [0x65, 0x03, 500], PR: 2 }
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

    const PR = new GeneralRegister("PR")

    // when, then

    const res = makeJPL(params.tokens, labels, flagRegister, grMap)
    test(`makeJPL returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen(memory)!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen(memory)!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      expect(new DataView(res?.gen(memory)!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
    })
    res?.gen(memory)!.proc(PR)
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
