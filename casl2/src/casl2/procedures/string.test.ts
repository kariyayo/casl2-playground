import { isHexadecimal } from "./strings"

describe(`isHexadecimal`, () => {
  describe.each([
    { param: "200", expected: false },
    { param: "-200", expected: false },
    { param: "#0000", expected: true },
    { param: "#02cE", expected: true },
    { param: "#FFFF", expected: true },
    { param: "#FFFG", expected: false },
    { param: "#FFF", expected: false },
  ])(`$# :: $params`, ({param, expected}) => {
    test(``, () => {
      expect(isHexadecimal(param)).toEqual(expected)
    })
  })
})
