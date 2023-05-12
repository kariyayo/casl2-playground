import { aggregateByLabel } from "./parser"

const testCase = [
  {
    param: `
SAMPLE1	START
; コメント行
				LD		GR1,A
				RET	
 ; コメント行
A				DC		3 ; ここもコメント
				END	
`,
    expected: (() => {
      const m = new Map()
      m.set("SAMPLE1", [
        {lineNum: 0, instructionNum: 0, label: "SAMPLE1", operator: "START", operand: ""},
        {lineNum: 2, instructionNum: 1, label: "", operator: "LD", operand: "GR1,A"},
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
    const result = aggregateByLabel(param.trim(), 0, () => {})
    if (result instanceof Error) {
      expect(result).toEqual(error)
    } else {
      let memAddress = 0
      expected.forEach((value, labelText) => {
        // check by label
        const pair = result.get(labelText)
        if (pair == null) {
          fail()
        } else {
          const [label, insts] = pair
          expect(insts.length).toEqual(value.length)
          expect(label.memAddress).toEqual(memAddress)
          insts.forEach((inst, idx) => {
            expect(inst.tokens).toEqual(expected.get(labelText)[idx])
            memAddress = memAddress + inst.wordLength
          })
        }
      })
    }
  })
})
