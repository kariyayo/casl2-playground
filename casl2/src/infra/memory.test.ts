import { Memory } from "./memory"

describe(`basic`, () => {
  const testCase = [
    {
      param: { address: 1000, value: 1001 },
      expected: {address: 1000, value: 1001},
      error: false,
    },
    {
      param: { address: 1000, value: -10 },
      expected: {address: 1000, value: -10},
      error: false,
    },
    {
      param: { address: 1000, value: 32767 },
      expected: {address: 1000, value: 32767},
      error: false,
    },
    {
      param: {address: 1000, value: 32768 },
      expected: { address: 0, value: 0 },
      error: true,
    },
    {
      param: {address: 65535*2+1, value: 1 },
      expected: { address: 0, value: 0 },
      error: true,
    }
  ]

  testCase.forEach(({ param, expected, error }, i) => {
    test(`test:${i}`, () => {
      const mem = new Memory()
      if (error) {
        expect(() => mem.store(param.address, param.value)).toThrow()
      } else {
        mem.store(param.address, param.value)
        expect(mem.lookup(expected.address)).toEqual(expected.value)
      }
    })
  })
})

describe(`storeBytecode`, () => {
  const testCase = [{}, {}]

  testCase.forEach((x, i) => {
    const mem = new Memory()
    const bf = new ArrayBuffer(4)
    const view = new DataView(bf)
    view.setUint16(0, 0x1210, false)
    view.setUint16(2, 0x0008, false)
    mem.storeBytecode(bf, 1000)
    expect(mem.lookupLogical(1000)).toEqual(0x1210)
    expect(mem.lookupLogical(1001)).toEqual(0x0008)
  })
})
