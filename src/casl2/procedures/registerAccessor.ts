import { GeneralRegister } from "../../infra/register"

export { isGeneralRegister, GeneralRegister, FlagRegister } from "../../infra/register"
export function getGrOrThrow(text: string, grMap: Map<string, GeneralRegister>): GeneralRegister {
  const gr = grMap.get(text)
  if (gr == null) {
    throw new Error(`not found Register: ${text}`)
  }
  return gr
}
