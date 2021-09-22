export function isNumeric(s: string): boolean {
  return numFmt.test(s)
}
const numFmt = /^[0-9]+$/
