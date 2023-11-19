#include <bits/stdc++.h>
#include "interpreter.cpp"

Memory* m;
Register* gr1;
Register* gr2;
Register* gr3;
Register* gr4;
Register* gr5;
Register* gr6;
Register* gr7;

Register* pr;

void dump() {
  std::cout << "gr1: " << std::setw(4) << std::setfill('0') << std::hex << std::uppercase << gr1->lookupLogical() << std::endl;
  std::cout << "gr2: " << std::setw(4) << std::setfill('0') << std::hex << std::uppercase << gr2->lookupLogical() << std::endl;
  std::cout << "gr3: " << std::setw(4) << std::setfill('0') << std::hex << std::uppercase << gr3->lookupLogical() << std::endl;
  std::cout << "gr4: " << std::setw(4) << std::setfill('0') << std::hex << std::uppercase << gr4->lookupLogical() << std::endl;
  std::cout << "gr5: " << std::setw(4) << std::setfill('0') << std::hex << std::uppercase << gr5->lookupLogical() << std::endl;
  std::cout << "gr6: " << std::setw(4) << std::setfill('0') << std::hex << std::uppercase << gr6->lookupLogical() << std::endl;
  std::cout << "gr7: " << std::setw(4) << std::setfill('0') << std::hex << std::uppercase << gr7->lookupLogical() << std::endl;
  std::cout << "pr: " << std::setw(4) << std::setfill('0') << std::hex << std::uppercase << pr->lookupLogical() << std::endl;
  std::cout << std::endl;
}

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

  int WORD_LENGTH = 2;
  auto startAddress = 2000;

  std::vector<uint8_t> content = std::vector(65535 * WORD_LENGTH, (uint8_t)0);
  auto iter = content.begin();
  iter += startAddress * WORD_LENGTH; 
  copy(input_data.begin(), input_data.end(), iter);

  m = new Memory(content.data(), content.size());

  pr = new Register();
  pr->store(startAddress);

  gr1 = new Register();
  gr2 = new Register();
  gr3 = new Register();
  gr4 = new Register();
  gr5 = new Register();
  gr6 = new Register();
  gr7 = new Register();

  auto intr = new Interpreter(pr, gr1, gr2, gr3, gr4, gr5, gr6, gr7, m);

  while (intr->step()) {
    dump();
  }
  std::cout << "\n";

  return 0;
}
