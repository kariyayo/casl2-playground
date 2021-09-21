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
    return this.content.getUint16(0)
  }

  store(value: number) {
    this.content.setUint16(0, value)
  }
}

export class FlagRegister {
  overflowFlag = false
  signFlag = false
  zeroFlag = false
  toString() {
    const of = this.overflowFlag ? "1" : "0"
    const sf = this.signFlag ? "1" : "0"
    const zf = this.zeroFlag ? "1" : "0"
    return of + sf + zf
  }
}
