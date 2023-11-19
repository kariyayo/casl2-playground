export function isDigits(s: string): boolean {
  return digits.test(s)
}
const digits = /^[0-9]+$/

export function isNumeric(s: string): boolean {
  return numFmt.test(s)
}
const numFmt = /^-?[1-9]?[0-9]+$/

export function isHexadecimal(s: string): boolean {
  return hexFmt.test(s)
}
const hexFmt = /^#[0-9A-Fa-f]{4}$/

export function isJisX0201(s: string): boolean {
  return jisX0201Fmt.test(s)
}
const jisX0201Fmt = /^[\s!"#$%&'()*+,-./0-9:;<=>?@A-Z\[¥\]^_`a-z{|}~]+$/

export function isAddress(s: string): boolean {
  if (isDigits(s)) {
    return true
  }
  return addressFmt.test(s)
}
const addressFmt = /^#[0-9A-Fa-f]+$/

export function normalizeAddress(s: string): number {
  if (s.startsWith("#")) {
    return parseInt(s.substring(1), 16)
  } else {
    return parseInt(s, 10)
  }
}
