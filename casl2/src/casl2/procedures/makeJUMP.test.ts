import { Label, Tokens } from "../types"
import { makeJUMP } from "./makeJUMP"
import { getGrOrThrow, GeneralRegister } from "./registerAccessor"

describe(`makeJUMP`, () => {

  describe.each([
    {
        tokens: create({ label: "BB", operator: "JUMP", operand: "500" }),
        expected: { wordLength: 2, bytecode: [0x64, 0x00, 500], PR: 500 }
    },
    {
        tokens: create({ label: "BB", operator: "JUMP", operand: "500,GR3" }),
        expected: { wordLength: 2, bytecode: [0x64, 0x03, 500], PR: 520 }
    },
    {
        tokens: create({ label: "BB", operator: "JUMP", operand: "AA,GR3" }),
        expected: { wordLength: 2, bytecode: [0x64, 0x03, 500], PR: 520 }
    },
  ])(`$# :: $tokens`, ({tokens, expected}) => {
    // given
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 500})

    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    getGrOrThrow("GR3", grMap).store(20)

    const PR = new GeneralRegister("PR")

    // when, then

    const res = makeJUMP(tokens, labels, grMap)
    test(`makeJUMP returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(expected.wordLength)
      expect(new DataView(res?.gen()!.bytecode).getUint8(0)).toEqual(expected.bytecode[0])
      expect(new DataView(res?.gen()!.bytecode).getUint8(1)).toEqual(expected.bytecode[1])
      expect(new DataView(res?.gen()!.bytecode).getUint16(2)).toEqual(expected.bytecode[2])
    })
    res?.gen()!.proc(PR)
    test(`PR should be stored`, () => {
      expect(PR.lookup()).toEqual(expected.PR)
    })
  })

  describe.each([
    { tokens: create({ label: "BB", operator: "JUMP", operand: "hogehoge" }) },
    { tokens: create({ label: "BB", operator: "JUMP", operand: "#a500" }) },
  ])(`$# :: $tokens`, ({tokens}) => {
    // given
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 500})

    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    const PR = new GeneralRegister("PR")

    // when, then
    test(`makeJUMP throw Error`, () => {
      expect(() => makeJUMP(tokens, labels, grMap)).toThrow()
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
