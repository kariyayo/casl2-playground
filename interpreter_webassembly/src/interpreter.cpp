#include <bits/stdc++.h>
#include "register.hpp"
#include "memory.hpp"

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
    return true;
  }
};
