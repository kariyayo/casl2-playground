export function isGeneralRegister(text: string): boolean {
  return ["GR0", "GR1", "GR2", "GR3", "GR4", "GR5", "GR6", "GR7"].indexOf(text) >= 0
}

export class GeneralRegister {
  content: DataView = new DataView(new ArrayBuffer(2))

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
}
