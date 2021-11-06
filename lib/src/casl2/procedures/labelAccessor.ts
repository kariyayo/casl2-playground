import { Label } from "../types"

export function getLabelOrThrow(text: string, labels: Map<string, Label>): Label {
  const label = labels.get(text)
  if (label == null) {
    throw new Error(`not found label: ${text}`)
  }
  return label
}
