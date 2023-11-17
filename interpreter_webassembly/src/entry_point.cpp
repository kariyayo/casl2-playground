#include <cstdlib>
#include <cstring>
#include <fstream>
#include "interpreter.cpp"

#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>
using namespace emscripten;

unsigned char *buf;
size_t bufSize;
Interpreter* intr;

struct StepResult {
  int pr;
  int gr1;
  int gr2;
  int gr3;
  int gr4;
  int gr5;
  int gr6;
  int gr7;
};

StepResult step() {
  intr->step();
  return StepResult{
    intr->pr->lookup(),
    intr->gr1->lookup(),
    intr->gr2->lookup(),
    intr->gr3->lookup(),
    intr->gr4->lookup(),
    intr->gr5->lookup(),
    intr->gr6->lookup(),
    intr->gr7->lookup(),
  };
}

val getMemory() {
  return val(typed_memory_view(bufSize, buf));
}

EMSCRIPTEN_BINDINGS(interpreter_module) {
  value_object<StepResult>("StepResult")
    .field("pr", &StepResult::pr)
    .field("gr1", &StepResult::gr1)
    .field("gr2", &StepResult::gr2)
    .field("gr3", &StepResult::gr3)
    .field("gr4", &StepResult::gr4)
    .field("gr5", &StepResult::gr5)
    .field("gr6", &StepResult::gr6)
    .field("gr7", &StepResult::gr7)
    ;

  function("step", &step);

  function("getMemory", &getMemory);
}


extern "C" {

  EMSCRIPTEN_KEEPALIVE int makeMachine(uint8_t* bytes, int size, int startAddress) {
    std::cout << "entry_point:: START!" << "\n";

    buf = bytes;
    bufSize = size;

    auto mem = new Memory(bytes, bufSize);
    auto pr = new Register();
    pr->store(startAddress);
    auto gr1 = new Register();
    auto gr2 = new Register();
    auto gr3 = new Register();
    auto gr4 = new Register();
    auto gr5 = new Register();
    auto gr6 = new Register();
    auto gr7 = new Register();
    intr = new Interpreter(pr, gr1, gr2, gr3, gr4, gr5, gr6, gr7, mem);

    // sp.storeLogical(0x9001);
    mem->store(0x9001, -32678);

    return 0;
  }

}
