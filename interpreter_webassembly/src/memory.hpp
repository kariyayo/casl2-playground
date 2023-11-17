#include <stddef.h>
#include <stdint.h>

class Memory
{
private :
  const int WORD_LENGTH = 2;
  uint8_t* buf;
  size_t bufSize;

public :
  Memory(uint8_t* buf, size_t bufSize);
  int16_t lookup(int address);
  uint16_t lookupLogical(int address);
  void store(int address, uint16_t value);
};
