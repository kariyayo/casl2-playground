import { tokenize } from "./tokenizer"

const testCase = [
  {
    param: "SAMPLE1	START",
    expected: {label: "SAMPLE1", operator: "START", operand: ""},
  },
  {
    param: "	LT	GR1,A",
    expected: {label: "", operator: "LT", operand: "GR1,A"},
  },
  {
    param: "	RET	",
    expected: {label: "", operator: "RET", operand: ""},
  },
  {
    param: "A	DC	3",
    expected: {label: "A", operator: "DC", operand: "3"},
  },
  {
    param: "A			DC		3",
    expected: {label: "A", operator: "DC", operand: "3"},
  },
  {
    param: "A			DC		3		",
    expected: {label: "A", operator: "DC", operand: "3"},
  },
  {
    param: "",
    expected: null,
    error: Error(`invalid token num. line:""`)
  },
]

testCase.forEach(({ param, expected, error }, i) => {
  test(`test[${i}]`, () => {
    const result = tokenize(param)
    if (result instanceof Error) {
      expect(tokenize(param)).toEqual(error)
    } else {
      expect(tokenize(param)).toEqual(expected)
    }
  })
})
