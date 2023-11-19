#include <cstdint>

class Register
{
private :
  uint16_t content;

public :
  Register();
  int16_t lookup();
  uint16_t lookupLogical();
  void store(int16_t value);
  void storeLogical(uint16_t value);
};
