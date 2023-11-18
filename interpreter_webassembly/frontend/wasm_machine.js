import { Memory } from "./infra/memory";
import { FlagRegister, GeneralRegister } from "./infra/register";
import { assemble } from "./assembler/assembler";

export function makeWasmMachine(input, startMemAddress) {
  const machine = new WasmMachine(input, startMemAddress);
  return machine;
}

class WasmMachine {
  constructor(input, startMemAddress) {
    this.FR = new FlagRegister();
    this.grMap = new Map();
    for (let i = 0; i <= 7; i++) {
        const name = `GR${i}`;
        this.grMap.set(name, new GeneralRegister(name));
    }
    this.PR = new GeneralRegister("PR");
    this.SP = new GeneralRegister("SP");
    this.SP.storeLogical(0x9001);
    this.PR.store(startMemAddress);
    this.labels = new Map();

    const tmpMemory = new Memory();
    this.assembleResult = assemble(startMemAddress, input, this.labels, tmpMemory)
    console.log("entry_point :: assemble SUCCESS")

    this.bufferForDebug = tmpMemory.content.buffer;

    // assembleの結果のバイト列をwasmのメモリにコピー
    const arr = new Uint8Array(tmpMemory.content.buffer);
    this.pointer = Module._malloc(Uint8Array.BYTES_PER_ELEMENT * arr.length);
    if (this.pointer == null) {
      throw new Error("entry_point :: malloc failed");
    }
    Module.HEAP8.set(arr, this.pointer / Uint8Array.BYTES_PER_ELEMENT);

    // wasmの関数を呼び出して初期化
    const setupResult = Module.ccall('makeMachine',
      'number',
      ['number', 'number', 'number'],
      [this.pointer, tmpMemory.content.byteLength, startMemAddress]
    );
    console.log("entry_point :: setupResult=", setupResult);

    // wasmのメモリの参照を取得してフィールドに保存
    const memoryUint8Array = Module.getMemory();
    this.memory = new Memory();
    this.memory.content = new DataView(memoryUint8Array.buffer, memoryUint8Array.byteOffset, memoryUint8Array.byteLength);
  }

  step() {
    const result = Module.step();
    this.PR.store(result.pr);
    this.SP.store(result.sp);
    this.grMap.get('GR1').store(result.gr1);
    this.grMap.get('GR2').store(result.gr2);
    this.grMap.get('GR3').store(result.gr3);
    this.grMap.get('GR4').store(result.gr4);
    this.grMap.get('GR5').store(result.gr5);
    this.grMap.get('GR6').store(result.gr6);
    this.grMap.get('GR7').store(result.gr7);
    this.FR.overflowFlag = result.overflowFlag;
    this.FR.signFlag = result.signFlag;
    this.FR.zeroFlag = result.zeroFlag;

    console.log("----- wasmMachine step output START -----")
    console.log("PR: " + this.PR.lookup())
    console.log("GR1: " + this.grMap.get('GR1').lookup())
    console.log("GR2: " + this.grMap.get('GR2').lookup())
    console.log("GR3: " + this.grMap.get('GR3').lookup())
    console.log("GR4: " + this.grMap.get('GR4').lookup())
    console.log("GR5: " + this.grMap.get('GR5').lookup())
    console.log("GR6: " + this.grMap.get('GR6').lookup())
    console.log("GR7: " + this.grMap.get('GR7').lookup())
    console.log("memory.lookupLogical():" + this.memory.lookupLogical(0).toString(16))
    console.log("memory.lookupLogical():" + this.memory.lookupLogical(1).toString(16))
    console.log("memory.lookupLogical():" + this.memory.lookupLogical(2).toString(16))
    console.log("memory.lookupLogical():" + this.memory.lookupLogical(3).toString(16))
    console.log("memory.lookupLogical():" + this.memory.lookupLogical(2000).toString(16))
    console.log("memory.lookupLogical():" + this.memory.lookupLogical(2001).toString(16))
    console.log("memory.lookupLogical():" + this.memory.lookupLogical(2002).toString(16))
    console.log("memory.lookupLogical():" + this.memory.lookupLogical(2003).toString(16))
    console.log("----- wasmMachine step output END -----")
  }
}
