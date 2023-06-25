#include <bits/stdc++.h>
#include "memory.hpp"

class Interpreter
{
private :
  Memory* memory;
  int wordLength;
  int currentPos = 0;

public :
  Interpreter(Memory* m, int wordLength) {
    memory = m;
    this->wordLength = wordLength;
  }

  std::pair<uint16_t, uint16_t> readWord() {
    if (currentPos >= wordLength) {
      return std::make_pair(0, 0);
    }
    auto word = memory->lookupLogical(currentPos);
    currentPos++;
    uint8_t lowerByte = word & 0b11111111;
    uint8_t upperByte = word >> 8;
    return std::make_pair(upperByte, lowerByte);
  }

  bool step() {
    auto pair = readWord();
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
