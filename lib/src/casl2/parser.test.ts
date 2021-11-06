import { aggregateByLabel } from "./parser"

const testCase = [
  {
    param: `
SAMPLE1	START
; コメント行
				LT		GR1,A
				RET	
 ; コメント行
A				DC		3 ; ここもコメント
				END	
`,
    expected: (() => {
      const m = new Map()
      m.set("SAMPLE1", [
          {lineNum: 0, instructionNum: 0, label: "SAMPLE1", operator: "START", operand: ""},
          {lineNum: 2, instructionNum: 1, label: "", operator: "LT", operand: "GR1,A"},
          {lineNum: 3, instructionNum: 2, label: "", operator: "RET", operand: ""},
      ])
      m.set("A", [
          {lineNum: 5, instructionNum: 3, label: "A", operator: "DC", operand: "3"},
          {lineNum: 6, instructionNum: 4, label: "", operator: "END", operand: ""},
      ])
      return m
    })(),
    error: null
  },
  {
    param: `
SAMPLE1	START
				RET	
SAMPLE1	DC	3
				END	
`,
    expected: new Map(),
    error: new Error("duplicated label: SAMPLE1"),
  },
]

testCase.forEach(({ param, expected, error }, i) => {
  test(`test[${i}]`, () => {
    const result = aggregateByLabel(param.trim())
    if (result instanceof Error) {
      expect(result).toEqual(error)
    } else {
      expect(result.size).toEqual(expected.size)
      expect(result).toEqual(expected)
    }
  })
})

