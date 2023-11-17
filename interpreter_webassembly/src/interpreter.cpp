#include <iomanip>
#include <iostream>
#include "register.hpp"
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

const int16_t END_ADDRESS = -32678;

class Interpreter
{
// private :
public :
  Register* pr;
  Register* gr1;
  Register* gr2;
  Register* gr3;
  Register* gr4;
  Register* gr5;
  Register* gr6;
  Register* gr7;
  Memory* memory;

  Interpreter(
    Register* pr,
    Register* gr1,
    Register* gr2,
    Register* gr3,
    Register* gr4,
    Register* gr5,
    Register* gr6,
    Register* gr7,
    Memory* memory
  ) {
    this->pr = pr;
    this->gr1 = gr1;
    this->gr2 = gr2;
    this->gr3 = gr3;
    this->gr4 = gr4;
    this->gr5 = gr5;
    this->gr6 = gr6;
    this->gr7 = gr7;
    this->memory = memory;
  }

  void advancePR() {
    auto v = pr->lookupLogical();
    pr->storeLogical(v + 1);
  }

  std::pair<uint16_t, uint16_t> readWord() {
    try {
      auto currentPos = pr->lookupLogical();
      std::cout << "Interpreter:: currentPos=" << currentPos << std::endl;
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
    std::cout << "Interpreter:: iterpreter.step()" << std::endl;
    if (pr->lookup() == END_ADDRESS) {
      std::cout << "Interpreter:: END" << std::endl;
      return false;
    }
    auto [opcode, operand] = readWord();
    advancePR();
    if (opcode == 0 && operand == 0) {
      std::cout << "Interpreter:: opcode == 0 && operand == 0" << std::endl;
      return false;
    }
    std::cout << std::setw(2) << std::setfill('0') << std::hex << std::uppercase << opcode << " ";
    std::cout << std::setw(2) << std::setfill('0') << std::hex << std::uppercase << operand << " ";
    std::cout << std::endl;

    switch (opcode) {
      case NOP:
        std::cout << "NOP";
        break;
      case LD:
        std::cout << "LD";
        break;
      case ADDA:
        std::cout << "ADDA";
        adda(operand);
        break;
      case SUBA:
        std::cout << "SUBA";
        break;
      case ADDL:
        std::cout << "ADDL";
        break;
      case SUBL:
        std::cout << "SUBL";
        break;
      case AND:
        std::cout << "AND";
        break;
      case OR:
        std::cout << "OR";
        break;
      case XOR:
        std::cout << "XOR";
        break;
      case CPA:
        std::cout << "CPA";
        break;
      case CPL:
        std::cout << "CPL";
        break;
      case POP:
        std::cout << "POP";
        break;
      case RET:
        std::cout << "RET";
        ret();
        break;
      default:
        auto [upper, lower] = readWord();
        advancePR();
        if (upper == 0 && lower == 0) {
          return false;
        }
        auto address = (upper << 8) + lower;
        std::cout << std::setw(2) << std::setfill('0') << std::hex << std::uppercase << address << " ";
        switch (opcode) {
          case LD2:
            std::cout << "LD2";
            ld2(operand, address);
            break;
          case ST:
            std::cout << "ST";
            st(operand, address);
            break;
          case LAD:
            std::cout << "LAD";
            break;
          case ADDA2:
            std::cout << "ADDA2";
            break;
          case SUBA2:
            std::cout << "SUBA2";
            break;
          case ADDL2:
            std::cout << "ADDL2";
            break;
          case SUBL2:
            std::cout << "SUBL2";
            break;
          case AND2:
            std::cout << "AND2";
            break;
          case OR2:
            std::cout << "OR2";
            break;
          case XOR2:
            std::cout << "XOR2";
            break;
          case CPA2:
            std::cout << "CPA2";
            break;
          case CPL2:
            std::cout << "CPL2";
            break;
          case SLA:
            std::cout << "SLA";
            break;
          case SRA:
            std::cout << "SRA";
            break;
          case SLL:
            std::cout << "SLL";
            break;
          case SRL:
            std::cout << "SRL";
            break;
          case JMI:
            std::cout << "JMI";
            break;
          case JNZ:
            std::cout << "JNZ";
            break;
          case JUMP:
            std::cout << "JUMP";
            break;
          case JPL:
            std::cout << "JPL";
            break;
          case JOV:
            std::cout << "JOV";
            break;
          case PUSH:
            std::cout << "PUSH";
            break;
          case CALL:
            std::cout << "CALL";
            break;
          default:
            throw std::runtime_error("Unknown opcode");
        }
        break;
    }
    std::cout << std::endl;
    return true;
  }

  std::pair<uint8_t, uint8_t> divide(uint8_t byte) {
    return std::make_pair(byte >> 4, byte & 0b1111);
  }

  Register* gr(uint8_t n) {
    switch (n) {
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

  void adda(uint8_t operands) {
    auto [n, m] = divide(operands);
    auto v = gr(n)->lookup() + gr(m)->lookup();
    std::cout << " operands=" << operands << ", n=" << std::to_string(n) << ", m=" << std::to_string(m) << ", v=" << std::to_string(v);
    gr(n)->store(v);
    // fr->set(v);
  }

  void ld2(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto xaddr = 0;
    if (x != 0) {
      xaddr = gr(x)->lookup();
    }
    auto v = memory->lookup(address + xaddr);
    std::cout << " operands=" << operands << ", address= " << address << ", n=" << std::to_string(n) << ", x=" << std::to_string(x) << ", xaddr=" << std::to_string(xaddr) << ", v=" << std::to_string(v);
    gr(n)->store(v);
    // fr->set(v);
  }

  void st(uint8_t operands, uint16_t address) {
    auto [n, x] = divide(operands);
    auto v = gr(n)->lookup();
    auto xaddr = 0;
    if (x != 0) {
      xaddr = gr(x)->lookup();
    }
    std::cout << " operands=" << operands << ", address= " << address << ", n=" << std::to_string(n) << ", x=" << std::to_string(x) << ", xaddr=" << std::to_string(xaddr) << ", v=" << std::to_string(v) << std::endl;
    memory->store(address + xaddr, v);
    std::cout << memory->lookup(address + xaddr) << std::endl;
  }

  void ret() {
    // FIXME
    pr->store(END_ADDRESS);
    // auto sp = spReg->lookup();
    // if (sp != END_ADDRESS) {
    //   auto address = memory->lookup(sp);
    //   prReg->store(address);
    //   spReg->store(sp + 1);
    // } else {
    //   prReg->store(END_ADDRESS);
    // }
  }

};
