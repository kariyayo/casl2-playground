#include <cstdint>

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
  void store(int address, int16_t value);
  void store(int address, std::string value);
  void storeLogical(int address, uint16_t value);
  void storeLogical(int address, std::string value);
};
