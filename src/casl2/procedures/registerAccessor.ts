import { Register } from "../../infra/register"

export { isGeneralRegister, Register } from "../../infra/register"
export function getGrOrThrow(text: string, grMap: Map<string, Register>): Register {
  const gr = grMap.get(text)
  if (gr == null) {
    throw new Error(`not found Register: ${text}`)
  }
  return gr
}