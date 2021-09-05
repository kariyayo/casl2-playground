import { tokenize } from "./tokenizer"

const testCase = [
  {
    param: "SAMPLE1	START",
    expected: {lineNum: 0, instructionNum: 0, label: "SAMPLE1", operator: "START", operand: ""},
  },
  {
    param: "	LT	GR1,A",
    expected: {lineNum: 0, instructionNum: 0, label: "", operator: "LT", operand: "GR1,A"},
  },
  {
    param: "	RET	",
    expected: {lineNum: 0, instructionNum: 0, label: "", operator: "RET", operand: ""},
  },
  {
    param: "A	DC	3",
    expected: {lineNum: 0, instructionNum: 0, label: "A", operator: "DC", operand: "3"},
  },
  {
    param: "A			DC		3",
    expected: {lineNum: 0, instructionNum: 0, label: "A", operator: "DC", operand: "3"},
  },
  {
    param: "A			DC		3		",
    expected: {lineNum: 0, instructionNum: 0, label: "A", operator: "DC", operand: "3"},
  },
  {
    param: "",
    expected: null,
    error: Error(`invalid token num. line:""`)
  },
]

testCase.forEach(({ param, expected, error }, i) => {
  test(`test[${i}]`, () => {
    const result = tokenize(param, 0, 0)
    if (result instanceof Error) {
      expect(result).toEqual(error)
    } else {
      expect(result).toEqual(expected)
    }
  })
})
