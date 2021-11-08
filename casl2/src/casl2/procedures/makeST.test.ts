import { Memory } from "../../infra/memory"
import { Label } from "../types"
import { makeST } from "./makeST"
import { GeneralRegister } from "./registerAccessor"

describe(`makeST`, () => {

  describe(`GR -> memory`, () => {
    const tokens = {
      lineNum: 1,
      instructionNum: 4,
      label: "AA",
      operator: "ST",
      operand: "GR1,#5000",
    }
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR1")?.store(123)
    const memory = new Memory()
    memory.store(5000, 0)

    const res = makeST(tokens, labels, grMap, memory)
    test(`makeST() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(2)
      expect(new DataView(res?.gen()!.bytecode).getUint8(0)).toEqual(0x11)
      expect(new DataView(res?.gen()!.bytecode).getUint8(1)).toEqual(0x10)
      expect(new DataView(res?.gen()!.bytecode).getUint16(2)).toEqual(5000)
    })

    res?.gen()!.proc(new GeneralRegister("PR"))
    test(`memory should be stored data`, () => {
      expect(memory.lookup(5000)).toEqual(123)
    })
  })

  describe(`GR <- memory+GRx`, () => {
    const tokens = {
      lineNum: 1,
      instructionNum: 4,
      label: "AA",
      operator: "ST",
      operand: "GR1,#5000,GR3",
    }
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR1")?.store(123)
    grMap.get("GR3")?.store(2)
    const memory = new Memory()

    const res = makeST(tokens, labels, grMap, memory)
    test(`makeST() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(2)
      expect(new DataView(res?.gen()!.bytecode).getUint8(0)).toEqual(0x11)
      expect(new DataView(res?.gen()!.bytecode).getUint8(1)).toEqual(0x13)
      expect(new DataView(res?.gen()!.bytecode).getUint16(2)).toEqual(5000)
    })

    res?.gen()!.proc(new GeneralRegister("PR"))
    test(`memory should be stored data`, () => {
      expect(memory.lookup(5000 + (grMap.get("GR3")?.lookup() || 0))).toEqual(123)
    })
  })
})
