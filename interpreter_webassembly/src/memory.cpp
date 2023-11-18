#include <iostream>
#include <string>
#include <stdexcept>
#include "memory.hpp"

Memory::Memory(uint8_t* buf, size_t bufSize) {
  this->buf = buf;
  this->bufSize = bufSize;
}

int16_t Memory::lookup(int address) {
  std::cout << "Memory::lookup() address =" << address << "\n";
  std::cout << "Memory::lookup() idx =" << address * WORD_LENGTH << "\n";
  uint8_t a = this->buf[address * WORD_LENGTH];
  uint8_t b = this->buf[address * WORD_LENGTH + 1];
  uint16_t res = (a << 8) + b;
  return (int16_t)res;
}

uint16_t Memory::lookupLogical(int address) {
  uint8_t a = this->buf[address * WORD_LENGTH];
  uint8_t b = this->buf[address * WORD_LENGTH + 1];
  uint16_t res = (a << 8) + b;
  return res;
}

void Memory::store(int address, int16_t value) {
  if ((unsigned)(address * WORD_LENGTH) > this->bufSize) {
    throw std::runtime_error("Memory::store() invalid address. address=" + std::to_string(address) + ", value=" + std::to_string(value));
  }
  if (value > INT16_MAX) {
    throw std::runtime_error("Memory::store() invalid value. address=" + std::to_string(address) + ", value=" + std::to_string(value));
  }
  uint8_t a = value >> 8;
  uint8_t b = value & 0b11111111;
  this->buf[address * WORD_LENGTH] = a;
  this->buf[address * WORD_LENGTH + 1] = b;
}

void Memory::store(int address, std::string value) {
  if ((unsigned)(address * WORD_LENGTH) > this->bufSize) {
    throw std::runtime_error("Memory::store() invalid address. address=" + std::to_string(address) + ", value=" + value);
  }
  if (stoi(value) > INT16_MAX) {
    throw std::runtime_error("Memory::store() invalid value. address=" + std::to_string(address) + ", value=" + value);
  }
  uint8_t a = stoi(value) >> 8;
  uint8_t b = stoi(value) & 0b11111111;
  this->buf[address * WORD_LENGTH] = a;
  this->buf[address * WORD_LENGTH + 1] = b;
}

void Memory::storeLogical(int address, uint16_t value) {
  if ((unsigned)(address * WORD_LENGTH) > this->bufSize) {
    throw std::runtime_error("Memory::storeLogical() invalid address. address=" + std::to_string(address) + ", value=" + std::to_string(value));
  }
  if (value > UINT16_MAX) {
    throw std::runtime_error("Memory::storeLogical() invalid value. address=" + std::to_string(address) + ", value=" + std::to_string(value));
  }
  uint8_t a = value >> 8;
  uint8_t b = value & 0b11111111;
  this->buf[address * WORD_LENGTH] = a;
  this->buf[address * WORD_LENGTH + 1] = b;
}

void Memory::storeLogical(int address, std::string value) {
  if ((unsigned)(address * WORD_LENGTH) > this->bufSize) {
    throw std::runtime_error("Memory::storeLogical() invalid address. address=" + std::to_string(address) + ", value=" + value);
  }
  if (stoi(value) > UINT16_MAX) {
    throw std::runtime_error("Memory::storeLogical() invalid value. address=" + std::to_string(address) + ", value=" + value);
  }
  uint8_t a = stoi(value) >> 8;
  uint8_t b = stoi(value) & 0b11111111;
  this->buf[address * WORD_LENGTH] = a;
  this->buf[address * WORD_LENGTH + 1] = b;
}
