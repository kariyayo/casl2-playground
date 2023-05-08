import { isNumeric } from "../casl2/procedures/strings"

export class Memory {
  content: DataView = new DataView(new ArrayBuffer(WORD_LENGTH * 65536))

  lookup(address: number): number {
    return this.content.getInt16(address * WORD_LENGTH)
  }

  lookupLogical(address: number): number {
    return this.content.getUint16(address * WORD_LENGTH)
  }

  store(address: number, value: number | string) {
    if (address * WORD_LENGTH > this.content.byteLength) {
      throw new Error(`invalid address. address=${address}`)
    }
    if (typeof value === 'string') {
      if (!isNumeric(value)) {
        throw new Error(`invalid value. value=${value}`)
      }
      value = Number(value)
    }
    if (value > INT16_MAX) {
      throw new Error(`invalid value. value=${value}`)
    }
    this.content.setInt16(address * WORD_LENGTH, value)
  }

  storeLogical(address: number, value: number | string) {
    if (address * WORD_LENGTH > this.content.byteLength) {
      throw new Error(`invalid address. address=${address}`)
    }
    if (typeof value === 'string') {
      if (!isNumeric(value)) {
        throw new Error(`invalid value. value=${value}`)
      }
      value = Number(value)
    }
    if (value > UINT16_MAX) {
      throw new Error(`invalid value. value=${value}`)
    }
    this.content.setInt16(address * WORD_LENGTH, value)
  }

  storeBytecode(bytecode: ArrayBuffer, offset: number) {
    const dataView = new DataView(bytecode)
    if (dataView.byteLength < 2) {
      throw new Error(`invalid bytecode. bytecode=${bytecode}`)
    }
    this.storeLogical(offset, dataView.getUint16(0, false))
    if (dataView.byteLength > 2) {
      this.storeLogical(offset + 1, dataView.getUint16(2, false))
    }
  }
}

const WORD_LENGTH = 2 // byte
const INT16_MAX = 32767
const UINT16_MAX = 65535
