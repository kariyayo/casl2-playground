#include <bits/stdc++.h>
#include "memory.hpp"

Memory::Memory(
  std::vector<uint8_t>::iterator begin,
  std::vector<uint8_t>::iterator end,
  int startAddress
) {
  content = std::vector(65535 * WORD_LENGTH, (uint8_t)0);
  std::cout << "size = " << content.size() << "\n";
  auto iter = content.begin();
  iter += startAddress * WORD_LENGTH; 
  std::cout << "startAddress = " << startAddress << "\n";
  std::cout << "iter = " << iter - content.begin() << "\n";
  copy(begin, end, iter);
}

Memory::~Memory() {
  content.clear();
}

int16_t Memory::lookup(int address) {
  uint8_t a = content[address * WORD_LENGTH];
  uint8_t b = content[address * WORD_LENGTH + 1];
  uint16_t res = (a << 8) + b;
  return (int16_t)res;
}

uint16_t Memory::lookupLogical(int address) {
  uint8_t a = content[address * WORD_LENGTH];
  uint8_t b = content[address * WORD_LENGTH + 1];
  uint16_t res = (a << 8) + b;
  return res;
}

void Memory::store(int address, uint16_t value) {
  if ((unsigned)(address * WORD_LENGTH) > content.size()) {
    throw std::runtime_error("invalid address");
  }
  uint8_t a = value >> 8;
  uint8_t b = value & 0b11111111;
  content[address * WORD_LENGTH] = a;
  content[address * WORD_LENGTH + 1] = b;
}
