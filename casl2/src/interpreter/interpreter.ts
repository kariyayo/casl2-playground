import { advancePR, setPR } from "../casl2/procedures/registerAccessor"
import { Memory } from "../infra/memory"
import { END_ADDRESS, FlagRegister, GeneralRegister } from "../infra/register"

// 1 word
const NOP  = 0x00
const LD   = 0x14
const ADDA = 0x24
const SUBA = 0x25
const ADDL = 0x26
const SUBL = 0x27
const AND  = 0x34
const OR   = 0x35
const XOR  = 0x36
const CPA  = 0x44
const CPL  = 0x45
const POP  = 0x71
const RET  = 0x81

// 2 words
const LD2   = 0x10
const ST    = 0x11
const LAD   = 0x12
const ADDA2 = 0x20
const SUBA2 = 0x21
const ADDL2 = 0x22
const SUBL2 = 0x23
const AND2  = 0x30
const OR2   = 0x31
const XOR2  = 0x32
const CPA2  = 0x40
const CPL2  = 0x41
const SLA   = 0x50
const SRA   = 0x51
const SLL   = 0x52
const SRL   = 0x53
const JMI   = 0x61
const JNZ   = 0x62
const JZE   = 0x63
const JUMP  = 0x64
const JPL   = 0x65
const JOV   = 0x66
const PUSH  = 0x70
const CALL  = 0x80

// no support
// const SVC   = 0xF0

export class Interpreter {
  grMap: Map<string, GeneralRegister>
  FR: FlagRegister
  PR: GeneralRegister
  SP: GeneralRegister
  memory: Memory

  constructor(
    grMap: Map<string, GeneralRegister>,
    FR: FlagRegister,
    PR: GeneralRegister,
    SP: GeneralRegister,
    memory: Memory,
    code: ArrayBuffer,
  ) {
    this.grMap = grMap
    this.FR = FR
    this.PR = PR
    this.SP = SP
    this.memory = memory

    const dataView = new DataView(code)
    const startByteOffset = 2*this.PR.lookupLogical()
    for (let i = 0; i < dataView.byteLength; i++) {
      this.memory.storeLogical(startByteOffset + i, dataView.getUint8(i))
    }
  }

  private divide(byte: number): [number, number] {
      return [
        byte >> 4,
        byte & 0b1111,
      ]
  }

  private gr(x: number): number {
    return this.grMap.get(`GR${x}`)?.lookup() || 0
  }

  private grLogical(x: number): number {
    return this.grMap.get(`GR${x}`)?.lookupLogical() || 0
  }

  private storeGr(x: number, value: number) {
    this.grMap.get(`GR${x}`)?.store(value)
  }

  private storeGrLogical(x: number, value: number) {
    this.grMap.get(`GR${x}`)?.storeLogical(value)
  }

  private readWord(): [number, number] {
    const upperByte = this.memory.lookupLogical(2*this.PR.lookupLogical())
    const lowerByte = this.memory.lookupLogical(1 + 2*this.PR.lookupLogical())
    return [upperByte, lowerByte]
  }

  run() {
    let next = true
    while (next) {
      next = this.step()
    }
  }

  step(): boolean {
    const [opcode, operands] = this.readWord()
    advancePR(this.PR, 1)
    switch (opcode) {
      case NOP:
        break
      case LD:
        this.ld(operands)
        break
      case ADDA:
        this.adda(operands)
        break
      case SUBA:
        this.suba(operands)
        break
      case ADDL:
        this.addl(operands)
        break
      case SUBL:
        this.subl(operands)
        break
      case AND:
        this.and(operands)
        break
      case OR:
        this.or(operands)
        break
      case XOR:
        this.xor(operands)
        break
      case CPA:
        this.cpa(operands)
        break
      case CPL:
        this.cpl(operands)
        break
      case POP:
        this.pop(operands)
        break
      case RET:
        this.ret()
        break
      default:
        const [upper, lower] = this.readWord()
        const address = (upper << 8) + lower
        advancePR(this.PR, 1)
        switch(opcode) {
          case LD2:
            this.ld2(operands, address)
            break
          case ST:
            this.st(operands, address)
            break
          case LAD:
            this.lad(operands, address)
            break
          case ADDA2:
            this.adda2(operands, address)
            break
          case SUBA2:
            this.suba2(operands, address)
            break
          case ADDL2:
            this.addl2(operands, address)
            break
          case SUBL2:
            this.subl2(operands, address)
            break
          case AND2:
            this.and2(operands, address)
            break
          case OR2:
            this.or2(operands, address)
            break
          case XOR2:
            this.xor2(operands, address)
            break
          case CPA2:
            this.cpa2(operands, address)
            break
          case CPL2:
            this.cpl2(operands, address)
            break
          case SLA:
            this.sla(operands, address)
            break
          case SRA:
            this.sra(operands, address)
            break
          case SLL:
            this.sll(operands, address)
            break
          case SRL:
            this.srl(operands, address)
            break
          case JMI:
            this.jmi(operands, address)
            break
          case JNZ:
            this.jnz(operands, address)
            break
          case JZE:
            this.jze(operands, address)
            break
          case JUMP:
            this.jump(operands, address)
            break
          case JPL:
            this.jpl(operands, address)
            break
          case JOV:
            this.jov(operands, address)
            break
          case PUSH:
            this.push(operands, address)
            break
          case CALL:
            this.call(operands, address)
            break
          default:
            throw new Error(`unknown opcode. opcode=${opcode}, operands=${operands}`)
        }
    }

    const next = this.PR.lookup()
    if (next == -32678) {
      return false
    }
    return true
  }

  ld(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.gr(m)
    this.storeGr(n, v)
    this.FR.set(v)
  }

  ld2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.memory.lookup(address + this.gr(x))
    this.storeGr(n, v)
    this.FR.set(v)
  }

  adda(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.gr(n) + this.gr(m)
    this.storeGr(n, v)
    this.FR.set(v)
  }

  adda2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.gr(n) + this.memory.lookup(address + this.gr(x))
    this.storeGr(n, v)
    this.FR.set(v)
  }

  suba(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.gr(n) - this.gr(m)
    this.storeGr(n, v)
    this.FR.set(v)
  }

  suba2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.gr(n) - this.memory.lookup(address + this.gr(x))
    this.storeGr(n, v)
    this.FR.set(v)
  }

  addl(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.grLogical(n) + this.grLogical(m)
    this.storeGrLogical(n, v)
    this.FR.setLogical(v)
  }

  addl2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.grLogical(n) + this.memory.lookupLogical(address + this.gr(x))
    this.storeGrLogical(n, v)
    this.FR.setLogical(v)
  }

  subl(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.grLogical(n) - this.grLogical(m)
    this.storeGrLogical(n, v)
    this.FR.setLogical(v)
  }

  subl2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.grLogical(n) - this.memory.lookupLogical(address + this.gr(x))
    this.storeGrLogical(n, v)
    this.FR.setLogical(v)
  }

  and(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.gr(n) & this.gr(m)
    this.storeGr(n, v)
    this.FR.set(v)
  }

  and2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.gr(n) & this.memory.lookup(address + this.gr(x))
    this.storeGr(n, v)
    this.FR.set(v)
  }

  or(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.gr(n) | this.gr(m)
    this.storeGr(n, v)
    this.FR.set(v)
  }

  or2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.gr(n) | this.memory.lookup(address + this.gr(x))
    this.storeGr(n, v)
    this.FR.set(v)
  }

  xor(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.gr(n) ^ this.gr(m)
    this.storeGr(n, v)
    this.FR.set(v)
  }

  xor2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.gr(n) ^ this.memory.lookup(address + this.gr(x))
    this.storeGr(n, v)
    this.FR.set(v)
  }

  cpa(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.gr(n) - this.gr(m)
    this.FR.setByCPA(v)
  }

  cpa2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.gr(n) - this.memory.lookup(address + this.gr(x))
    this.FR.setByCPA(v)
  }

  cpl(operands: number) {
    const [n, m] = this.divide(operands)
    const v = this.grLogical(n) - this.grLogical(m)
    this.FR.setLogicalByCPL(v)
  }

  cpl2(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.grLogical(n) - this.memory.lookupLogical(address + this.gr(x))
    this.FR.setLogicalByCPL(v)
  }

  pop(operands: number) {
    const [n, _] = this.divide(operands)
    const address = this.memory.lookupLogical(this.SP.lookupLogical())
    this.storeGrLogical(n, address)
    this.SP.storeLogical(this.SP.lookupLogical() + 1)
  }

  push(operands: number, address: number) {
    // address -> memory(SP-1)
    const [_, x] = this.divide(operands)
    this.SP.storeLogical(this.SP.lookupLogical() - 1)
    this.memory.storeLogical(this.SP.lookupLogical(), address + this.gr(x))
  }

  ret() {
    const sp = this.SP.lookupLogical()
    if (sp != END_ADDRESS) {
      const address = this.memory.lookupLogical(sp)
      this.PR.storeLogical(address)
      this.SP.storeLogical(sp+1)
    } else {
      this.PR.store(-32678)
    }
  }

  call(operands: number, address: number) {
    // PR -> memory(SP-1)
    // address -> PR
    const [_, x] = this.divide(operands)
    const wordLength = 2
    this.SP.storeLogical(this.SP.lookupLogical() - 1)
    this.memory.storeLogical(this.SP.lookupLogical(), this.PR.lookupLogical())
    this.PR.storeLogical(address + this.gr(x))
  }

  st(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = this.gr(n)
    this.memory.store(address + this.gr(x), v)
  }

  lad(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const v = address + this.gr(x)
    this.storeGr(n, v)
  }

  sla(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const isNegative = ((this.gr(n) >> 15) & 1) != 0
    const b = address + this.gr(x)
    let v = this.gr(n) << b
    if (isNegative) {
      v = v | (1 << 15)
    } else {
      v = v & ~(1 << 15)
    }
    let overflowFlag = false
    if (((this.grLogical(n) >> (16 -1 - b)) & 1) !== 0) {
      overflowFlag = true
    }
    this.storeGr(n, v)
    this.FR.setWithOverflowFlag(v, overflowFlag)
  }

  sra(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const b = address + this.gr(x)
    let v = this.gr(n) >> b
    let overflowFlag = false
    if (((this.grLogical(n) >> (b - 1)) & 1) !== 0) {
      overflowFlag = true
    }
    this.storeGr(n, v)
    this.FR.setWithOverflowFlag(v, overflowFlag)
  }

  sll(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const b = address + this.gr(x)
    let v = this.gr(n) << b
    let overflowFlag = false
    if (((this.grLogical(n) >> (16 - b)) & 1) !== 0) {
      overflowFlag = true
    }
    this.storeGr(n, v)
    this.FR.setWithOverflowFlag(v, overflowFlag)
  }

  srl(operands: number, address: number) {
    const [n, x] = this.divide(operands)
    const b = address + this.gr(x)
    let v = this.grLogical(n) >>> b
    let overflowFlag = false
    if (((this.grLogical(n) >> (b - 1)) & 1) !== 0) {
      overflowFlag = true
    }
    this.storeGr(n, v)
    this.FR.setWithOverflowFlag(v, overflowFlag)
  }

  jmi(operands: number, address: number) {
    const [_, x] = this.divide(operands)
    if (this.FR.sf()) {
      setPR(this.PR, address + this.gr(x))
    }
  }

  jnz(operands: number, address: number) {
    const [_, x] = this.divide(operands)
    if (!this.FR.zf()) {
      setPR(this.PR, address + this.gr(x))
    }
  }

  jze(operands: number, address: number) {
    const [_, x] = this.divide(operands)
    if (this.FR.zf()) {
      setPR(this.PR, address + this.gr(x))
    }
  }

  jump(operands: number, address: number) {
    const [_, x] = this.divide(operands)
    setPR(this.PR, address + this.gr(x))
  }

  jpl(operands: number, address: number) {
    const [_, x] = this.divide(operands)
    if (!this.FR.sf()) {
      setPR(this.PR, address + this.gr(x))
    }
  }

  jov(operands: number, address: number) {
    const [_, x] = this.divide(operands)
    if (this.FR.of()) {
      setPR(this.PR, address + this.gr(x))
    }
  }
}
