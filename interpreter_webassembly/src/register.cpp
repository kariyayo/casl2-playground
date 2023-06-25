#include <bits/stdc++.h>
#include "register.hpp"

Register::Register() {
  content = 0;
}

int16_t Register::lookup() {
  return content;
}

uint16_t Register::lookupLogical() {
  return content;
}

void Register::store(int16_t value) {
  content = value;
}

void Register::storeLogical(uint16_t value) {
  content = value;
}
