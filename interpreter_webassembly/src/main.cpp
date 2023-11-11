#include <bits/stdc++.h>
#include "interpreter.cpp"

int main() {
  std::cout << "START!" << "\n";

  auto s = "test_inputfile";
  std::ifstream ifs(s, std::ios::in | std::ios::binary);
  if (ifs.fail()) {
    std::cout << "file can not open." << std::endl;
    return 1;
  }

  std::istreambuf_iterator<char> it_ifs_begin(ifs);
  std::istreambuf_iterator<char> it_ifs_end {};
  std::vector<uint8_t> input_data(it_ifs_begin, it_ifs_end);
  if (ifs.fail()) {
    std::cerr << "file read error" << "\n";
    return 1;
  }
  ifs.close();

  auto startAddress = 2000;
  auto m = new Memory(input_data.begin(), input_data.end(), startAddress);
  auto intr = new Interpreter(startAddress, m, input_data.size());
  std::cout << "size = " << input_data.size() << "\n";
  while (intr->step()) {}
  std::cout << "\n";

  return 0;
}
