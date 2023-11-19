#include <string>
#include "flag_register.hpp"

FlagRegister::FlagRegister() {
  overflow_flag = false;
  zero_flag = false;
  sign_flag = false;
}

void FlagRegister::set_sf_zf(int value) {
  if ((value & 0x8000) != 0) {
    // negative
    sign_flag = true;
  } else {
    sign_flag = false;
  }
  if ((value & 0xffff) != 0) {
    // not zero
    zero_flag = false;
  } else {
    zero_flag = true;
  }
}

bool FlagRegister::of() {
  return overflow_flag;
}

bool FlagRegister::zf() {
  return zero_flag;
}

bool FlagRegister::sf() {
  return sign_flag;
}

void FlagRegister::set(int value) {
  if (-32768 <= value && value <= 32767) {
    overflow_flag = false;
  } else {
    overflow_flag = true;
  }
  set_sf_zf(value);
}

void FlagRegister::set_logical(int value) {
  if (0 <= value && value <= 65535) {
    overflow_flag = false;
  } else {
    overflow_flag = true;
  }
  set_sf_zf(value);
}

void FlagRegister::set_with_overflow_flag(int value, bool overflow_flag) {
  this->overflow_flag = overflow_flag;
  set_sf_zf(value);
}

void FlagRegister::set_by_cpa(int value) {
  overflow_flag = false;
  if (value < 0) {
    // negative
    sign_flag = true;
  } else {
    sign_flag = false;
  }
  if (value == 0) {
    zero_flag = true;
  } else {
    // not zero
    zero_flag = false;
  }
}

void FlagRegister::set_logical_by_cpl(int value) {
  overflow_flag = false;
  if (value < 0) {
    // negative
    sign_flag = true;
  } else {
    sign_flag = false;
  }
  if (value == 0) {
    zero_flag = true;
  } else {
    // not zero
    zero_flag = false;
  }
}

std::string FlagRegister::to_string() {
  std::string of = overflow_flag ? "1" : "0";
  std::string sf = sign_flag ? "1" : "0";
  std::string zf = zero_flag ? "1" : "0";
  return of + sf + zf;
}
