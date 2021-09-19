import { assemble, display } from "./assembler";
import { Label, Tokens } from "./casl2/types";
import { Memory } from "./infra/memory";
import { FlagRegister, GeneralRegister } from "./infra/register";

describe(`assemble`, () => {
  const FR = new FlagRegister()
  const PR = new GeneralRegister("PR")
  const SP = new GeneralRegister("SP")
  const grMap = new Map()
  for (let i = 0; i <= 7; i++) {
    const name = `GR${i}`
    grMap.set(name, new GeneralRegister(name))
  }
  const memory = new Memory()
  const labels: Map<string, Label> = new Map()
  const startAddress = 0x1000
  describe(``, () => {
    const program = `HOGE	START
			LAD		GR1,8
			LD		GR2,AAA
			ADDA	GR1,AAA,GR2
			RET
AAA	DC		1
			DC		3
			END`
    const res = assemble(startAddress, program, labels, FR, grMap, memory)
    test(`1L`, () => {
      expect(res[0].memAddress).toEqual(0x1000)
      expect(res[0].bytecode.byteLength).toEqual(0)
      expect(res[0].tokens.lineNum).toEqual(0)
      expect(res[0].tokens.instructionNum).toEqual(0)
      expect(res[0].tokens.label).toEqual("HOGE")
      expect(res[0].tokens.operator).toEqual("START")
      expect(res[0].tokens.operand).toEqual("")
    })

    test(`2L`, () => {
      expect(res[1].memAddress).toEqual(0x1000)
      expect(res[1].bytecode.byteLength).toEqual(4)
      expect(value(res[1].bytecode)).toEqual("1210 0008")
      expect(res[1].tokens.lineNum).toEqual(1)
      expect(res[1].tokens.instructionNum).toEqual(1)
      expect(res[1].tokens.label).toEqual("")
      expect(res[1].tokens.operator).toEqual("LAD")
      expect(res[1].tokens.operand).toEqual("GR1,8")
    })

    test(`3L`, () => {
      expect(res[2].memAddress).toEqual(0x1002)
      expect(res[2].bytecode.byteLength).toEqual(4)
      expect(value(res[2].bytecode)).toEqual("1020 1007")
      expect(res[2].tokens.lineNum).toEqual(2)
      expect(res[2].tokens.instructionNum).toEqual(2)
      expect(res[2].tokens.label).toEqual("")
      expect(res[2].tokens.operator).toEqual("LD")
      expect(res[2].tokens.operand).toEqual("GR2,AAA")
    })

    test(`4L`, () => {
      expect(res[3].memAddress).toEqual(0x1004)
      expect(res[3].bytecode.byteLength).toEqual(4)
      expect(value(res[3].bytecode)).toEqual("2012 1007")
      expect(res[3].tokens.lineNum).toEqual(3)
      expect(res[3].tokens.instructionNum).toEqual(3)
      expect(res[3].tokens.label).toEqual("")
      expect(res[3].tokens.operator).toEqual("ADDA")
      expect(res[3].tokens.operand).toEqual("GR1,AAA,GR2")
    })

    test(`5L`, () => {
      expect(res[4].memAddress).toEqual(0x1006)
      expect(res[4].bytecode.byteLength).toEqual(2)
      expect(value(res[4].bytecode)).toEqual("8100")
      expect(res[4].tokens.lineNum).toEqual(4)
      expect(res[4].tokens.instructionNum).toEqual(4)
      expect(res[4].tokens.label).toEqual("")
      expect(res[4].tokens.operator).toEqual("RET")
      expect(res[4].tokens.operand).toEqual("")
    })

    test(`6L`, () => {
      expect(res[5].memAddress).toEqual(0x1007)
      expect(res[5].bytecode.byteLength).toEqual(2)
      expect(value(res[5].bytecode)).toEqual("0001")
      expect(res[5].tokens.lineNum).toEqual(5)
      expect(res[5].tokens.instructionNum).toEqual(5)
      expect(res[5].tokens.label).toEqual("AAA")
      expect(res[5].tokens.operator).toEqual("DC")
      expect(res[5].tokens.operand).toEqual("1")
    })

    test(`7L`, () => {
      expect(res[6].memAddress).toEqual(0x1008)
      expect(res[6].bytecode.byteLength).toEqual(2)
      expect(value(res[6].bytecode)).toEqual("0003")
      expect(res[6].tokens.lineNum).toEqual(6)
      expect(res[6].tokens.instructionNum).toEqual(6)
      expect(res[6].tokens.label).toEqual("")
      expect(res[6].tokens.operator).toEqual("DC")
      expect(res[6].tokens.operand).toEqual("3")
    })

    test(`8L`, () => {
      expect(res[7].memAddress).toEqual(0x1009)
      expect(res[7].bytecode.byteLength).toEqual(0)
      expect(res[7].tokens.lineNum).toEqual(7)
      expect(res[7].tokens.instructionNum).toEqual(7)
      expect(res[7].tokens.label).toEqual("")
      expect(res[7].tokens.operator).toEqual("END")
      expect(res[7].tokens.operand).toEqual("")
    })
  })
})

function value(bytecode: ArrayBuffer): string {
  const view = new DataView(bytecode)
  let v = ""
  if (bytecode.byteLength >= 2) {
    v = view.getUint8(0).toString(16).padStart(2, "0")
    v = v + view.getUint8(1).toString(16).padStart(2, "0")
  }
  if (bytecode.byteLength >= 4) {
    v = v + " "
    v = v + view.getUint16(2).toString(16).padStart(4, "0")
  }
  return v
}
