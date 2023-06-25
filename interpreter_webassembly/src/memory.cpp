#include <bits/stdc++.h>
#include "memory.hpp"

Memory::Memory(std::vector<uint8_t> v) {
  content = v;
}

Memory::~Memory() {
  content.clear();
}

uint16_t Memory::lookupLogical(const int address) {
  uint8_t a = content[address * WORD_LENGTH];
  uint8_t b = content[address * WORD_LENGTH + 1];
  uint16_t res = (a << 8) + b;
  return res;
}
