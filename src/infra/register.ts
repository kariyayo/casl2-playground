export function isGeneralRegister(text: string): boolean {
  return ["GR0", "GR1", "GR2", "GR3", "GR4", "GR5", "GR6", "GR7"].indexOf(text) >= 0
}

export class GeneralRegister {
  content: DataView = new DataView(new ArrayBuffer(2))
  name: string
  constructor(name: string) {
    this.name = name
  }

  lookup(): number {
    return this.content.getInt16(0)
  }

  store(value: number) {
    this.content.setInt16(0, value)
  }
}

export class FlagRegister {
  overflowFlag = false
  signFlag = false
  zeroFlag = false

  of(): boolean {
    return this.overflowFlag
  }

  sf(): boolean {
    return this.signFlag
  }

  zf(): boolean {
    return this.zeroFlag
  }

  set(v: number) {
    if (v < 0) {
      this.signFlag = true
      this.zeroFlag = false
    } else if (v > 0) {
      this.signFlag = false
      this.zeroFlag = false
    } else {
      this.signFlag = false
      this.zeroFlag = true
    }
    if (-32768 <= v && v <= 32767) {
      this.overflowFlag = false
    } else {
      this.overflowFlag = true
    }
  }

  toString() {
    const of = this.overflowFlag ? "1" : "0"
    const sf = this.signFlag ? "1" : "0"
    const zf = this.zeroFlag ? "1" : "0"
    return of + sf + zf
  }
}
