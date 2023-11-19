#include <iostream>
#include "register.hpp"
#include "flag_register.hpp"
#include "memory.hpp"

// 1 word
const uint8_t NOP  = 0x00;
const uint8_t LD   = 0x14;
const uint8_t ADDA = 0x24;
const uint8_t SUBA = 0x25;
const uint8_t ADDL = 0x26;
const uint8_t SUBL = 0x27;
const uint8_t AND  = 0x34;
const uint8_t OR   = 0x35;
const uint8_t XOR  = 0x36;
const uint8_t CPA  = 0x44;
const uint8_t CPL  = 0x45;
const uint8_t POP  = 0x71;
const uint8_t RET  = 0x81;

// 2 words
const uint8_t LD2   = 0x10;
const uint8_t ST    = 0x11;
const uint8_t LAD   = 0x12;
const uint8_t ADDA2 = 0x20;
const uint8_t SUBA2 = 0x21;
const uint8_t ADDL2 = 0x22;
const uint8_t SUBL2 = 0x23;
const uint8_t AND2  = 0x30;
const uint8_t OR2   = 0x31;
const uint8_t XOR2  = 0x32;
const uint8_t CPA2  = 0x40;
const uint8_t CPL2  = 0x41;
const uint8_t SLA   = 0x50;
const uint8_t SRA   = 0x51;
const uint8_t SLL   = 0x52;
const uint8_t SRL   = 0x53;
const uint8_t JMI   = 0x61;
const uint8_t JNZ   = 0x62;
const uint8_t JZE   = 0x63;
const uint8_t JUMP  = 0x64;
const uint8_t JPL   = 0x65;
const uint8_t JOV   = 0x66;
const uint8_t PUSH  = 0x70;
const uint8_t CALL  = 0x80;

// no support
// const int SVC   = 0xF0;

const uint16_t END_ADDRESS = 0xE000;

class Interpreter
{
// private :
public :
  Register* gr0;
  Register* gr1;
  Register* gr2;
  Register* gr3;
  Register* gr4;
  Register* gr5;
  Register* gr6;
  Register* gr7;
  FlagRegister* fr;
  Register* pr;
  Register* sp;
  Memory* memory;

  Interpreter(
    Register* gr0,
    Register* gr1,
    Register* gr2,
    Register* gr3,
    Register* gr4,
    Register* gr5,
    Register* gr6,
    Register* gr7,
    FlagRegister* fr,
    Register* pr,
    Register* sp,
    Memory* memory
  ) {
    this->gr0 = gr0;
    this->gr1 = gr1;
    this->gr2 = gr2;
    this->gr3 = gr3;
    this->gr4 = gr4;
    this->gr5 = gr5;
    this->gr6 = gr6;
    this->gr7 = gr7;
    this->fr = fr;
    this->pr = pr;
    this->sp = sp;
    this->memory = memory;
  }

  void advancePR() {
    auto v = pr->lookupLogical();
    pr->storeLogical(v + 1);
  }

  std::pair<uint16_t, uint16_t> readWord() {
    try {
      auto currentPos = pr->lookupLogical();
      auto word = memory->lookupLogical(currentPos);
      uint8_t lowerByte = word & 0b11111111;
      uint8_t upperByte = word >> 8;
      return std::make_pair(upperByte, lowerByte);
    } catch (const std::exception& e) {
      std::cout << "Interpreter:: readWord() exception: " << e.what() << std::endl;
      return std::make_pair(0, 0);
    }
  }

  bool step() {
    if (pr->lookupLogical() == END_ADDRESS) {
      return false;
    }
    auto [opcode, operand] = readWord();
    advancePR();
    if (opcode == 0 && operand == 0) {
      return false;
    }

    switch (opcode) {
      case NOP:
        break;
      case LD:
        ld(operand);
        break;
      case ADDA:
        adda(operand);
        break;
      case SUBA:
        suba(operand);
        break;
      case ADDL:
        addl(operand);
        break;
      case SUBL:
        subl(operand);
        break;
      case AND:
        and1(operand);
        break;
      case OR:
        or1(operand);
        break;
      case XOR:
        xor1(operand);
        break;
      case CPA:
        cpa(operand);
        break;
      case CPL:
        cpl(operand);
        break;
      case POP:
        pop(operand);
        break;
      case RET:
        ret();
        break;
      default:
        auto [upper, lower] = readWord();
        advancePR();
        uint16_t address = (upper << 8) + lower;
        switch (opcode) {
          case LD2:
            ld2(operand, address);
            break;
          case ST:
            st(operand, address);
            break;
          case LAD:
            lad(operand, address);
            break;
          case ADDA2:
            adda2(operand, address);
            break;
          case SUBA2:
            suba2(operand, address);
            break;
          case ADDL2:
            addl2(operand, address);
            break;
          case SUBL2:
            subl2(operand, address);
            break;
          case AND2:
            and2(operand, address);
            break;
          case OR2:
            or2(operand, address);
            break;
          case XOR2:
            xor2(operand, address);
            break;
          case CPA2:
            cpa2(operand, address);
            break;
          case CPL2:
            cpl2(operand, address);
            break;
          case SLA:
            sla(operand, address);
            break;
          case SRA:
            sra(operand, address);
            break;
          case SLL:
            sll(operand, address);
            break;
          case SRL:
            srl(operand, address);
            break;
          case JMI:
            jmi(operand, address);
            break;
          case JNZ:
            jnz(operand, address);
            break;
          case JZE:
            jze(operand, address);
            break;
          case JUMP:
            jump(operand, address);
            break;
          case JPL:
            jpl(operand, address);
            break;
          case JOV:
            jov(operand, address);
            break;
          case PUSH:
            push(operand, address);
            break;
          case CALL:
            call(operand, address);
            break;
          default:
            throw std::runtime_error("Unknown opcode");
        }
        break;
    }
    auto next = pr->lookupLogical();
    if (next == END_ADDRESS) {
      return false;
    }
    return true;
  }

  std::pair<uint8_t, uint8_t> divide(uint8_t byte) {
    return std::make_pair(byte >> 4, byte & 0b1111);
  }

  Register* gr(uint8_t n) {
    switch (n) {
      case 0:
        return gr0;
      case 1:
        return gr1;
      case 2:
        return gr2;
      case 3:
        return gr3;
      case 4:
        return gr4;
      case 5:
        return gr5;
      case 6:
        return gr6;
      case 7:
        return gr7;
      default:
        throw std::runtime_error("Unknown register: GR" + std::to_string(n));
    }
  }

  int xaddr(int x) {
    if (1 <= x && x <= 7) {
      return gr(x)->lookupLogical();
    }
    return 0;
  }

  void ld(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(m)->lookup();
    gr(n)->store(v);
    fr->set(v);
  }

  void ld2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = memory->lookup(address + xaddr(x));
    gr(n)->store(v);
    fr->set(v);
  }

  void adda(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookup() + gr(m)->lookup();
    gr(n)->store(v);
    fr->set(v);
  }

  void adda2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookup() + memory->lookup(address + xaddr(x));
    gr(n)->store(v);
    fr->set(v);
  }

  void suba(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookup() - gr(m)->lookup();
    gr(n)->store(v);
    fr->set(v);
  }

  void suba2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookup() - memory->lookup(address + xaddr(x));
    gr(n)->store(v);
    fr->set(v);
  }

  void addl(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookupLogical() + gr(m)->lookupLogical();
    gr(n)->storeLogical(v);
    fr->set_logical(v);
  }

  void addl2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookupLogical() + memory->lookupLogical(address + xaddr(x));
    gr(n)->storeLogical(v);
    fr->set_logical(v);
  }

  void subl(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookupLogical() - gr(m)->lookupLogical();
    gr(n)->storeLogical(v);
    fr->set_logical(v);
  }

  void subl2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookupLogical() - memory->lookupLogical(address + xaddr(x));
    gr(n)->storeLogical(v);
    fr->set_logical(v);
  }

  void and1(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookup() & gr(m)->lookup();
    gr(n)->store(v);
    fr->set(v);
  }

  void and2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookup() & memory->lookup(address + xaddr(x));
    gr(n)->store(v);
    fr->set(v);
  }

  void or1(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookup() | gr(m)->lookup();
    gr(n)->store(v);
    fr->set(v);
  }

  void or2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookup() | memory->lookup(address + xaddr(x));
    gr(n)->store(v);
    fr->set(v);
  }

  void xor1(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookup() ^ gr(m)->lookup();
    gr(n)->store(v);
    fr->set(v);
  }

  void xor2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookup() ^ memory->lookup(address + xaddr(x));
    gr(n)->store(v);
    fr->set(v);
  }

  void cpa(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookup() - gr(m)->lookup();
    fr->set_by_cpa(v);
  }

  void cpa2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookup() - memory->lookup(address + xaddr(x));
    fr->set_by_cpa(v);
  }

  void cpl(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookupLogical() - gr(m)->lookupLogical();
    fr->set_logical_by_cpl(v);
  }

  void cpl2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookupLogical() - memory->lookupLogical(address + xaddr(x));
    fr->set_logical_by_cpl(v);
  }

  void pop(uint8_t operands) {
    auto [n, x] = divide(operands);
    auto v = memory->lookup(sp->lookupLogical());
    gr(n)->storeLogical(v);
    sp->storeLogical(sp->lookupLogical() + 1);
  }

  void push(uint8_t operands, uint16_t address) {
    auto [_, x] = divide(operands);
    sp->storeLogical(sp->lookupLogical() - 1);
    memory->storeLogical(sp->lookupLogical(), address + xaddr(x));
  }

  void ret() {
    auto sp_value = sp->lookupLogical();
    if (sp_value != END_ADDRESS) {
      auto address = memory->lookupLogical(sp_value);
      pr->storeLogical(address);
      sp->storeLogical(sp_value + 1);
    } else {
      pr->store(END_ADDRESS);
    }
  }

  void call(uint8_t operands, uint16_t address) {
    auto [_, x] = divide(operands);
    sp->storeLogical(sp->lookupLogical() - 1);
    memory->storeLogical(sp->lookupLogical(), pr->lookupLogical());
    pr->storeLogical(address + xaddr(x));
  }

  void st(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookup();
    memory->store(address + xaddr(x), v);
  }

  void lad(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    gr(n)->store(address + xaddr(x));
  }

  void sla(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto isNegative = ((gr(n)->lookup() >> 15) & 1) != 0;
    auto b = address + xaddr(x);
    auto v = gr(n)->lookup() << b;
    if (isNegative) {
      v = v | (1 << 15);
    } else {
      v = v & ~(1 << 15);
    }
    auto overflow = false;
    if (((gr(n)->lookupLogical() >> (16 - 1 - b)) & 1) != 0) {
      overflow = true;
    }
    gr(n)->store(v);
    fr->set_with_overflow_flag(v, overflow);
  }

  void sra(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto b = address + xaddr(x);
    auto v = gr(n)->lookup() >> b;
    auto overflow = false;
    if (((gr(n)->lookupLogical() >> (b - 1)) & 1) != 0) {
      overflow = true;
    }
    gr(n)->store(v);
    fr->set_with_overflow_flag(v, overflow);
  }

  void sll(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto b = address + xaddr(x);
    auto v = gr(n)->lookup() << b;
    auto overflow = false;
    if (((gr(n)->lookup() >> (16 - b)) & 1) != 0) {
      overflow = true;
    }
    gr(n)->store(v);
    fr->set_with_overflow_flag(v, overflow);
  }

  void srl(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto b = address + xaddr(x);
    // auto v = gr(n)->lookupLogical() >>> b;
    auto v = gr(n)->lookupLogical() >> b;
    auto overflow = false;
    if (((gr(n)->lookup() >> (b - 1)) & 1) != 0) {
      overflow = true;
    }
    gr(n)->store(v);
    fr->set_with_overflow_flag(v, overflow);
  }

  void jmi(uint8_t operands, uint16_t address) {
    auto [_, x] = divide(operands);
    if (fr->sf()) {
      pr->store(address + xaddr(x));
    }
  }

  void jnz(uint8_t operands, uint16_t address) {
    auto [_, x] = divide(operands);
    if (!fr->zf()) {
      pr->store(address + xaddr(x));
    }
  }

  void jze(uint8_t operands, uint16_t address) {
    auto [_, x] = divide(operands);
    if (fr->zf()) {
      pr->store(address + xaddr(x));
    }
  }

  void jump(uint8_t operands, uint16_t address) {
    auto [_, x] = divide(operands);
    pr->store(address + xaddr(x));
  }

  void jpl(uint8_t operands, uint16_t address) {
    auto [_, x] = divide(operands);
    if (!fr->sf()) {
      pr->store(address + xaddr(x));
    }
  }

  void jov(uint8_t operands, uint16_t address) {
    auto [_, x] = divide(operands);
    if (fr->of()) {
      pr->store(address + xaddr(x));
    }
  }
};
