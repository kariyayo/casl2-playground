#include <bits/stdc++.h>
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

class Interpreter
{
private :
  Register* pr;
  Memory* memory;
  int wordLength;

public :
  Interpreter(Register* pr, Memory* memory, int wordLength) {
    this->pr = pr;
    this->memory = memory;
    this->wordLength = wordLength;
  }

  void advancePR() {
    auto v = pr->lookupLogical();
    pr->storeLogical(v + 1);
  }

  std::pair<uint16_t, uint16_t> readWord() {
    auto currentPos = pr->lookupLogical();
    if (currentPos >= wordLength) {
      return std::make_pair(0, 0);
    }
    auto word = memory->lookupLogical(currentPos);
    uint8_t lowerByte = word & 0b11111111;
    uint8_t upperByte = word >> 8;
    return std::make_pair(upperByte, lowerByte);
  }

  bool step() {
    auto pair = readWord();
    advancePR();
    auto opcode = pair.first;
    auto operand = pair.second;
    if (opcode == 0 && operand == 0) {
      return false;
    }
    std::cout << std::setw(2) << std::setfill('0') << std::hex << std::uppercase << opcode << " ";
    std::cout << std::setw(2) << std::setfill('0') << std::hex << std::uppercase << operand << " ";

    switch (opcode) {
      case NOP:
        std::cout << "NOP";
        break;
      case LD:
        std::cout << "LD";
        break;
      case ADDA:
        std::cout << "ADDA";
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
        break;
      default:
        auto pair = readWord();
        advancePR();
        auto upper = pair.first;
        auto lower = pair.second;
        if (opcode == 0 && operand == 0) {
          return false;
        }
        auto address = (upper << 8) + lower;
        std::cout << std::setw(2) << std::setfill('0') << std::hex << std::uppercase << address << " ";
        switch (opcode) {
          case LD2:
            std::cout << "LD";
            break;
          case ST:
            std::cout << "ST";
            break;
          case LAD:
            std::cout << "LAD";
            break;
          case ADDA2:
            std::cout << "ADDA";
            break;
          case SUBA2:
            std::cout << "SUBA";
            break;
          case ADDL2:
            std::cout << "ADDL";
            break;
          case SUBL2:
            std::cout << "SUBL";
            break;
          case AND2:
            std::cout << "AND";
            break;
          case OR2:
            std::cout << "OR";
            break;
          case XOR2:
            std::cout << "XOR";
            break;
          case CPA2:
            std::cout << "CPA";
            break;
          case CPL2:
            std::cout << "CPL";
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
};
