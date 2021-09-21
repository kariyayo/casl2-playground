import { Commet2, makeMachine } from "./machine"

function display(machine: Commet2) {
  console.log(machine.PR.lookup())
}

describe(`machine`, () => {
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
    const machine = makeMachine(program, startAddress)

    test(`1L`, () => {
      expect(machine.assembleResult[0].memAddress).toEqual(0x1000)
      expect(machine.assembleResult[0].bytecode).toEqual(null)
      expect(machine.assembleResult[0].tokens.lineNum).toEqual(0)
      expect(machine.assembleResult[0].tokens.instructionNum).toEqual(0)
      expect(machine.assembleResult[0].tokens.label).toEqual("HOGE")
      expect(machine.assembleResult[0].tokens.operator).toEqual("START")
      expect(machine.assembleResult[0].tokens.operand).toEqual("")
    })

    test(`2L`, () => {
      expect(machine.assembleResult[1].memAddress).toEqual(0x1000)
      expect(machine.assembleResult[1].bytecode?.byteLength).toEqual(4)
      expect(value(machine.assembleResult[1].bytecode)).toEqual("1210 0008")
      expect(machine.assembleResult[1].tokens.lineNum).toEqual(1)
      expect(machine.assembleResult[1].tokens.instructionNum).toEqual(1)
      expect(machine.assembleResult[1].tokens.label).toEqual("")
      expect(machine.assembleResult[1].tokens.operator).toEqual("LAD")
      expect(machine.assembleResult[1].tokens.operand).toEqual("GR1,8")
    })

    test(`3L`, () => {
      expect(machine.assembleResult[2].memAddress).toEqual(0x1002)
      expect(machine.assembleResult[2].bytecode?.byteLength).toEqual(4)
      expect(value(machine.assembleResult[2].bytecode)).toEqual("1020 1007")
      expect(machine.assembleResult[2].tokens.lineNum).toEqual(2)
      expect(machine.assembleResult[2].tokens.instructionNum).toEqual(2)
      expect(machine.assembleResult[2].tokens.label).toEqual("")
      expect(machine.assembleResult[2].tokens.operator).toEqual("LD")
      expect(machine.assembleResult[2].tokens.operand).toEqual("GR2,AAA")
    })

    test(`4L`, () => {
      expect(machine.assembleResult[3].memAddress).toEqual(0x1004)
      expect(machine.assembleResult[3].bytecode?.byteLength).toEqual(4)
      expect(value(machine.assembleResult[3].bytecode)).toEqual("2012 1007")
      expect(machine.assembleResult[3].tokens.lineNum).toEqual(3)
      expect(machine.assembleResult[3].tokens.instructionNum).toEqual(3)
      expect(machine.assembleResult[3].tokens.label).toEqual("")
      expect(machine.assembleResult[3].tokens.operator).toEqual("ADDA")
      expect(machine.assembleResult[3].tokens.operand).toEqual("GR1,AAA,GR2")
    })

    test(`5L`, () => {
      expect(machine.assembleResult[4].memAddress).toEqual(0x1006)
      expect(machine.assembleResult[4].bytecode?.byteLength).toEqual(2)
      expect(value(machine.assembleResult[4].bytecode)).toEqual("8100")
      expect(machine.assembleResult[4].tokens.lineNum).toEqual(4)
      expect(machine.assembleResult[4].tokens.instructionNum).toEqual(4)
      expect(machine.assembleResult[4].tokens.label).toEqual("")
      expect(machine.assembleResult[4].tokens.operator).toEqual("RET")
      expect(machine.assembleResult[4].tokens.operand).toEqual("")
    })

    test(`6L`, () => {
      expect(machine.assembleResult[5].memAddress).toEqual(0x1007)
      expect(machine.assembleResult[5].bytecode?.byteLength).toEqual(2)
      expect(value(machine.assembleResult[5].bytecode)).toEqual("0001")
      expect(machine.assembleResult[5].tokens.lineNum).toEqual(5)
      expect(machine.assembleResult[5].tokens.instructionNum).toEqual(5)
      expect(machine.assembleResult[5].tokens.label).toEqual("AAA")
      expect(machine.assembleResult[5].tokens.operator).toEqual("DC")
      expect(machine.assembleResult[5].tokens.operand).toEqual("1")
    })

    test(`7L`, () => {
      expect(machine.assembleResult[6].memAddress).toEqual(0x1008)
      expect(machine.assembleResult[6].bytecode?.byteLength).toEqual(2)
      expect(value(machine.assembleResult[6].bytecode)).toEqual("0003")
      expect(machine.assembleResult[6].tokens.lineNum).toEqual(6)
      expect(machine.assembleResult[6].tokens.instructionNum).toEqual(6)
      expect(machine.assembleResult[6].tokens.label).toEqual("")
      expect(machine.assembleResult[6].tokens.operator).toEqual("DC")
      expect(machine.assembleResult[6].tokens.operand).toEqual("3")
    })

    test(`8L`, () => {
      expect(machine.assembleResult[7].memAddress).toEqual(0x1009)
      expect(machine.assembleResult[7].bytecode).toEqual(null)
      expect(machine.assembleResult[7].tokens.lineNum).toEqual(7)
      expect(machine.assembleResult[7].tokens.instructionNum).toEqual(7)
      expect(machine.assembleResult[7].tokens.label).toEqual("")
      expect(machine.assembleResult[7].tokens.operator).toEqual("END")
      expect(machine.assembleResult[7].tokens.operand).toEqual("")
    })

    test(`step()`, () => {
      // startAddress stored in PR
      expect(machine.PR.lookup()).toEqual(startAddress)

      // LAD GR1,8
      expect(machine.grMap.get("GR1")!.lookup()).toEqual(0)
      expect(machine.step()).toEqual(true)
      expect(machine.PR.lookup()).toEqual(0x1002)
      expect(machine.grMap.get("GR1")!.lookup()).toEqual(8)

      // LD GR2,AAA
      expect(machine.step()).toEqual(true)
      expect(machine.PR.lookup()).toEqual(0x1004)
      expect(machine.memory.lookup(machine.labels.get("AAA")!.memAddress)).toEqual(1)
      expect(machine.grMap.get("GR2")!.lookup()).toEqual(1)

      // ADDA GR1,AAA,GR2
      expect(machine.grMap.get("GR1")!.lookup()).toEqual(8)
      expect(machine.memory.lookup(machine.labels.get("AAA")!.memAddress + machine.grMap.get("GR2")!.lookup())).toEqual(3)
      expect(machine.step()).toEqual(true)
      expect(machine.PR.lookup()).toEqual(0x1006)
      expect(machine.grMap.get("GR1")!.lookup()).toEqual(8 + 3)

      // RET
      expect(machine.step()).toEqual(true)
      expect(machine.PR.lookup()).toEqual(0xEEEE)
      expect(machine.step()).toEqual(false)
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