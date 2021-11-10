export function isDigits(s: string): boolean {
  return digits.test(s)
}
const digits = /^[0-9]+$/

export function isNumeric(s: string): boolean {
  return numFmt.test(s)
}
const numFmt = /^-?[1-9]?[0-9]+$/

export function isAddress(s: string): boolean {
  return addressFmt.test(s)
}
const addressFmt = /^#?[0-9]+$/
