import { isHexadecimal, isJisX0201 } from "./strings"

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

describe(`isJisX0201`, () => {
  describe.each([
    { param: "", expected: false },
    { param: " ", expected: true },
    { param: "/", expected: true },
    { param: "AZ", expected: true },
    { param: "az", expected: true },
    { param: "09", expected: true },
    { param: "\\", expected: false }, // not supported in JIS X 0201
    { param: "¥", expected: true },  // supported in JIS X 0201
  ])(`$# :: $params`, ({param, expected}) => {
    test(``, () => {
      expect(isJisX0201(param)).toEqual(expected)
    })
  })
})
