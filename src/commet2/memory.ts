export class Memory {
  content: DataView = new DataView(new ArrayBuffer(WORD_LENGTH * 65536))

  lookup(address: number): number {
    return this.content.getInt16(address)
  }

  store(address: number, value: number) {
    if (address > this.content.byteLength) {
      throw new Error(`invalid address. address=${address}`)
    }
    if (value > INT16_MAX) {
      throw new Error(`invalid value. value=${value}`)
    }
    this.content.setInt16(address, value)
  }
}

const WORD_LENGTH = 2 // byte
const INT16_MAX = 32767
