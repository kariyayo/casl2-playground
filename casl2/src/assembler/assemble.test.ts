import { assemble, display } from "./assembler";
import { Label, Tokens } from "./types";
import { Memory } from "../infra/memory";
import { FlagRegister, GeneralRegister } from "../infra/register";

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
    const assembleResult = assemble(startAddress, program, labels, memory)
    test(`1L`, () => {
      expect(assembleResult[0].memAddress).toEqual(0x1000)
      expect(assembleResult[0].bytecode).toEqual(null)
      expect(assembleResult[0].tokens.lineNum).toEqual(0)
      expect(assembleResult[0].tokens.instructionNum).toEqual(0)
      expect(assembleResult[0].tokens.label).toEqual("HOGE")
      expect(assembleResult[0].tokens.operator).toEqual("START")
      expect(assembleResult[0].tokens.operand).toEqual("")
    })

    test(`2L`, () => {
      expect(assembleResult[1].memAddress).toEqual(0x1000)
      expect(assembleResult[1].bytecode?.byteLength).toEqual(4)
      expect(value(assembleResult[1].bytecode)).toEqual("1210 0008")
      expect(assembleResult[1].tokens.lineNum).toEqual(1)
      expect(assembleResult[1].tokens.instructionNum).toEqual(1)
      expect(assembleResult[1].tokens.label).toEqual("")
      expect(assembleResult[1].tokens.operator).toEqual("LAD")
      expect(assembleResult[1].tokens.operand).toEqual("GR1,8")
      expect(memory.lookupLogical(0x1000)).toEqual(0x1210)
      expect(memory.lookupLogical(0x1001)).toEqual(0x0008)
    })

    test(`3L`, () => {
      expect(assembleResult[2].memAddress).toEqual(0x1002)
      expect(assembleResult[2].bytecode?.byteLength).toEqual(4)
      expect(value(assembleResult[2].bytecode)).toEqual("1020 1007")
      expect(assembleResult[2].tokens.lineNum).toEqual(2)
      expect(assembleResult[2].tokens.instructionNum).toEqual(2)
      expect(assembleResult[2].tokens.label).toEqual("")
      expect(assembleResult[2].tokens.operator).toEqual("LD")
      expect(assembleResult[2].tokens.operand).toEqual("GR2,AAA")
      expect(memory.lookupLogical(0x1002)).toEqual(0x1020)
      expect(memory.lookupLogical(0x1003)).toEqual(0x1007)
    })

    test(`4L`, () => {
      expect(assembleResult[3].memAddress).toEqual(0x1004)
      expect(assembleResult[3].bytecode?.byteLength).toEqual(4)
      expect(value(assembleResult[3].bytecode)).toEqual("2012 1007")
      expect(assembleResult[3].tokens.lineNum).toEqual(3)
      expect(assembleResult[3].tokens.instructionNum).toEqual(3)
      expect(assembleResult[3].tokens.label).toEqual("")
      expect(assembleResult[3].tokens.operator).toEqual("ADDA")
      expect(assembleResult[3].tokens.operand).toEqual("GR1,AAA,GR2")
      expect(memory.lookupLogical(0x1004)).toEqual(0x2012)
      expect(memory.lookupLogical(0x1005)).toEqual(0x1007)
    })

    test(`5L`, () => {
      expect(assembleResult[4].memAddress).toEqual(0x1006)
      expect(assembleResult[4].bytecode?.byteLength).toEqual(2)
      expect(value(assembleResult[4].bytecode)).toEqual("8100")
      expect(assembleResult[4].tokens.lineNum).toEqual(4)
      expect(assembleResult[4].tokens.instructionNum).toEqual(4)
      expect(assembleResult[4].tokens.label).toEqual("")
      expect(assembleResult[4].tokens.operator).toEqual("RET")
      expect(assembleResult[4].tokens.operand).toEqual("")
      expect(memory.lookupLogical(0x1006)).toEqual(0x8100)
    })

    test(`6L`, () => {
      expect(assembleResult[5].memAddress).toEqual(0x1007)
      expect(assembleResult[5].bytecode?.byteLength).toEqual(2)
      expect(value(assembleResult[5].bytecode)).toEqual("0001")
      expect(assembleResult[5].tokens.lineNum).toEqual(5)
      expect(assembleResult[5].tokens.instructionNum).toEqual(5)
      expect(assembleResult[5].tokens.label).toEqual("AAA")
      expect(assembleResult[5].tokens.operator).toEqual("DC")
      expect(assembleResult[5].tokens.operand).toEqual("1")
      expect(memory.lookupLogical(0x1007)).toEqual(0x0001)
    })

    test(`7L`, () => {
      expect(assembleResult[6].memAddress).toEqual(0x1008)
      expect(assembleResult[6].bytecode?.byteLength).toEqual(2)
      expect(value(assembleResult[6].bytecode)).toEqual("0003")
      expect(assembleResult[6].tokens.lineNum).toEqual(6)
      expect(assembleResult[6].tokens.instructionNum).toEqual(6)
      expect(assembleResult[6].tokens.label).toEqual("")
      expect(assembleResult[6].tokens.operator).toEqual("DC")
      expect(assembleResult[6].tokens.operand).toEqual("3")
      expect(memory.lookupLogical(0x1008)).toEqual(0x0003)
    })

    test(`8L`, () => {
      expect(assembleResult[7].memAddress).toEqual(0x1009)
      expect(assembleResult[7].bytecode).toEqual(null)
      expect(assembleResult[7].tokens.lineNum).toEqual(7)
      expect(assembleResult[7].tokens.instructionNum).toEqual(7)
      expect(assembleResult[7].tokens.label).toEqual("")
      expect(assembleResult[7].tokens.operator).toEqual("END")
      expect(assembleResult[7].tokens.operand).toEqual("")
    })
  })
})

function value(bytecode: ArrayBuffer | null): string {
  if (bytecode == null) throw new Error("bytecode is null")
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
