export class Memory {
  content: DataView = new DataView(new ArrayBuffer(WORD_LENGTH * 65536))

  lookup(address: number): number {
    return this.content.getInt16(address)
  }

  store(address: number, value: number | string) {
    if (address > this.content.byteLength) {
      throw new Error(`invalid address. address=${address}`)
    }
    if (value > INT16_MAX) {
      throw new Error(`invalid value. value=${value}`)
    }
    if (typeof value === 'string') {
      if (!isNumeric(value)) {
        throw new Error(`invalid value. value=${value}`)
      }
      this.content.setInt16(address, Number(value))
    } else {
      this.content.setInt16(address, value)
    }
  }
}

export const START_ADDRESS = 1000
export const WORD_LENGTH = 2 // byte
const INT16_MAX = 32767

const numFmt = /[0-9]+/
function isNumeric(s: string): boolean {
  return numFmt.test(s)
}
