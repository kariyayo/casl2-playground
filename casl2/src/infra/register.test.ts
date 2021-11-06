import { FlagRegister } from "./register"

describe(`FlagRegister`, () => {
    const flagRegister = new FlagRegister()
    test(`set(32767)`, () => {
      flagRegister.set(32767)
      expect(flagRegister.toString()).toEqual("000")
    })
    test(`set(32768)`, () => {
      flagRegister.set(32768)
      expect(flagRegister.toString()).toEqual("110")
    })
    test(`set(65535)`, () => {
      flagRegister.set(65535)
      expect(flagRegister.toString()).toEqual("110")
    })
    test(`set(65536)`, () => {
      flagRegister.set(65536)
      expect(flagRegister.toString()).toEqual("101")
    })
    test(`setLogical(32767)`, () => {
      flagRegister.setLogical(32767)
      expect(flagRegister.toString()).toEqual("000")
    })
    test(`setLogical(32768)`, () => {
      flagRegister.setLogical(32768)
      expect(flagRegister.toString()).toEqual("010")
    })
    test(`setLogical(65535)`, () => {
      flagRegister.setLogical(65535)
      expect(flagRegister.toString()).toEqual("010")
    })
    test(`setLogical(65536)`, () => {
      flagRegister.setLogical(65536)
      expect(flagRegister.toString()).toEqual("101")
    })
})
