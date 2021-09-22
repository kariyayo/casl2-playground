import { GeneralRegister } from "../../infra/register"

export { isGeneralRegister, GeneralRegister, FlagRegister } from "../../infra/register"
export function getGrOrThrow(text: string, grMap: Map<string, GeneralRegister>): GeneralRegister {
  const gr = grMap.get(text)
  if (gr == null) {
    throw new Error(`not found Register: ${text}`)
  }
  return gr
}
export function grToBytecode(gr: GeneralRegister | null): number {
  if (gr == null) return 0
  switch (gr.name) {
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
  return 0
}

export function advancePR(PR: GeneralRegister, words: number) {
  const v = PR.lookup()
  PR.store(v+words)
}

export function setPR(PR: GeneralRegister, address: number) {
  PR.store(address)
}
