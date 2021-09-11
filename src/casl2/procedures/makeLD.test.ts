import { Memory } from "../../infra/memory"
import { Label } from "../types"
import { makeLD } from "./makeLD"
import { GeneralRegister } from "./registerAccessor"

describe(`makeLD`, () => {

  describe(`GR <- memory`, () => {
    const tokens = {
      lineNum: 1,
      instructionNum: 4,
      label: "AA",
      operator: "LD",
      operand: "GR1,#5000",
    }
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    const memory = new Memory()
    memory.store(5000, 123)

    const res = makeLD(tokens, labels, grMap, memory)
    test(`makeLD() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(2)
      expect(new DataView(res?.gen().bytecode).getUint8(0)).toEqual(0x10)
      expect(new DataView(res?.gen().bytecode).getUint8(1)).toEqual(0x10)
      expect(new DataView(res?.gen().bytecode).getUint16(2)).toEqual(5000)
    })

    res?.gen().proc()
    test(`GR1 should be loaded data`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(123)
    })
  })

  describe(`GR <- memory+GRx`, () => {
    const tokens = {
      lineNum: 1,
      instructionNum: 4,
      label: "AA",
      operator: "LD",
      operand: "GR1,#5000,GR3",
    }
    const labels = new Map<string, Label>()
    labels.set("AA", {label: "AA", memAddress: 2000})
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR3")?.store(2)
    const memory = new Memory()
    memory.store(5000 + (grMap.get("GR3")?.lookup() || 0), 123)

    const res = makeLD(tokens, labels, grMap, memory)
    test(`makeLD() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(2)
      expect(new DataView(res?.gen().bytecode).getUint8(0)).toEqual(0x10)
      expect(new DataView(res?.gen().bytecode).getUint8(1)).toEqual(0x13)
      expect(new DataView(res?.gen().bytecode).getUint16(2)).toEqual(5002)
    })

    res?.gen().proc()
    test(`GR1 should be loaded data`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(123)
    })
  })

  describe(`GR <- GR`, () => {
    const tokens = {
      lineNum: 1,
      instructionNum: 4,
      label: "AA",
      operator: "LD",
      operand: "GR1,GR2",
    }
    const labels = new Map<string, Label>()
    const grMap = new Map<string, GeneralRegister>()
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      grMap.set(name, new GeneralRegister(name))
    }
    grMap.get("GR2")?.store(123)
    const memory = new Memory()

    const res = makeLD(tokens, labels, grMap, memory)
    test(`makeLD() returns Instruction`, () => {
      expect(res?.gen).not.toBeNull()
      expect(res?.wordLength).toBe(1)
      expect(new DataView(res?.gen().bytecode).getUint8(0)).toEqual(0x14)
      expect(new DataView(res?.gen().bytecode).getUint8(1)).toEqual(0x12)
    })

    res?.gen().proc()
    test(`GR1 should be loaded data`, () => {
      expect(grMap.get("GR1")?.lookup()).toEqual(123)
    })
  })

})
