import { Memory } from "./infra/memory"
import { FlagRegister, GeneralRegister, END_ADDRESS } from "./infra/register"
import { Label } from "./assembler/types"
import { assemble, AssembleResult } from "./assembler/assembler"
import { Interpreter } from "./interpreter/interpreter"

export function makeMachine(input: string, startMemAddress: number): Commet2 {
  return new Commet2(input, startMemAddress)
}

export class Commet2 {
  FR: FlagRegister = new FlagRegister()
  grMap: Map<string, GeneralRegister> = new Map()
  PR: GeneralRegister = new GeneralRegister("PR")

  memory = new Memory()
  SP: GeneralRegister = new GeneralRegister("SP")

  labels: Map<string, Label> = new Map()
  assembleResult: AssembleResult = []
  interpreter: Interpreter

  constructor(input: string, startMemAddress: number) {
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      this.grMap.set(name, new GeneralRegister(name))
    }
    this.PR.store(startMemAddress)
    this.assembleResult = assemble(startMemAddress, input, this.labels, this.FR, this.grMap, this.memory, this.SP)
    this.interpreter = new Interpreter(this.grMap, this.FR, this.PR, this.SP, this.memory)

    this.SP.storeLogical(0x9001)
    this.memory.store(0x9001, END_ADDRESS)
  }

  step(): boolean {
    return this.interpreter.step()
  }
}
