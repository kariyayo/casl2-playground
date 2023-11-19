#include <cstdint>
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
  int sp;
  int gr0;
  int gr1;
  int gr2;
  int gr3;
  int gr4;
  int gr5;
  int gr6;
  int gr7;
  bool overflowFlag;
  bool signFlag;
  bool zeroFlag;
};

StepResult step() {
  intr->step();
  return StepResult{
    intr->pr->lookupLogical(),
    intr->sp->lookupLogical(),
    intr->gr0->lookupLogical(),
    intr->gr1->lookupLogical(),
    intr->gr2->lookupLogical(),
    intr->gr3->lookupLogical(),
    intr->gr4->lookupLogical(),
    intr->gr5->lookupLogical(),
    intr->gr6->lookupLogical(),
    intr->gr7->lookupLogical(),
    intr->fr->of(),
    intr->fr->sf(),
    intr->fr->zf()
  };
}

val getMemory() {
  return val(typed_memory_view(bufSize, buf));
}

EMSCRIPTEN_BINDINGS(interpreter_module) {
  value_object<StepResult>("StepResult")
    .field("pr", &StepResult::pr)
    .field("sp", &StepResult::sp)
    .field("gr0", &StepResult::gr0)
    .field("gr1", &StepResult::gr1)
    .field("gr2", &StepResult::gr2)
    .field("gr3", &StepResult::gr3)
    .field("gr4", &StepResult::gr4)
    .field("gr5", &StepResult::gr5)
    .field("gr6", &StepResult::gr6)
    .field("gr7", &StepResult::gr7)
    .field("overflowFlag", &StepResult::overflowFlag)
    .field("signFlag", &StepResult::signFlag)
    .field("zeroFlag", &StepResult::zeroFlag)
    ;

  function("step", &step);

  function("getMemory", &getMemory);
}


extern "C" {

  EMSCRIPTEN_KEEPALIVE int makeMachine(uint8_t* bytes, int size, int startAddress) {
    std::cout << "entry_point:: START! startAddress=" << startAddress << "\n";

    buf = bytes;
    bufSize = size;

    auto mem = new Memory(bytes, bufSize);
    auto gr0 = new Register();
    auto gr1 = new Register();
    auto gr2 = new Register();
    auto gr3 = new Register();
    auto gr4 = new Register();
    auto gr5 = new Register();
    auto gr6 = new Register();
    auto gr7 = new Register();
    auto fr = new FlagRegister();
    auto pr = new Register();
    pr->store(startAddress);
    auto sp = new Register();
    sp->storeLogical(0x9000);
    intr = new Interpreter(gr0, gr1, gr2, gr3, gr4, gr5, gr6, gr7, fr, pr, sp, mem);

    mem->store(0x9000, 0xE000);

    return 0;
  }

}
