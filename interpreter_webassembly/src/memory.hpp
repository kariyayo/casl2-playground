#include <bits/stdc++.h>

class Memory
{
private :
  const int WORD_LENGTH = 2;
  std::vector<uint8_t> content;

public :
  Memory(std::vector<uint8_t> ptr);
  ~Memory();
  uint16_t lookupLogical(const int address);
};
