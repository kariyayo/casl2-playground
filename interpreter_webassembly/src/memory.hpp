#include <bits/stdc++.h>

class Memory
{
private :
  const int WORD_LENGTH = 2;
  std::vector<uint8_t> content;

public :
  Memory(
    std::vector<uint8_t>::iterator begin,
    std::vector<uint8_t>::iterator end,
    int start
  );
  ~Memory();
  int16_t lookup(int address);
  uint16_t lookupLogical(int address);
  void store(int address, uint16_t value);
};
