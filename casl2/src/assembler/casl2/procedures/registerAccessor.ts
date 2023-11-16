import { GeneralRegister } from "../../../infra/register"

export { isGeneralRegister, GeneralRegister, FlagRegister, END_ADDRESS } from "../../../infra/register"

export function getGrByteCodeOrThrow(text: string): number {
  switch (text) {
    case "GR1":
      return 1
    case "GR2":
      return 2
    case "GR3":
      return 3
    case "GR4":
      return 4
    case "GR5":
      return 5
    case "GR6":
      return 6
    case "GR7":
      return 7
  }
  throw new Error(`invalid Register: ${text}`)
}

export function advancePR(PR: GeneralRegister, words: number) {
  const v = PR.lookupLogical()
  PR.storeLogical(v+words)
}

export function setPR(PR: GeneralRegister, address: number) {
  PR.store(address)
}
