import { Memory } from "./infra/memory";
import { FlagRegister, GeneralRegister } from "./infra/register";
import { Label } from "./casl2/types";
import { assemble, AssembleResult, ProcMap } from "./assembler";

export function makeMachine(input: string, startMemAddress: number): Commet2 {
  return new Commet2(input, startMemAddress)
}

export class Commet2 {
  FR: FlagRegister = new FlagRegister()
  SP: GeneralRegister = new GeneralRegister("SP")
  grMap: Map<string, GeneralRegister> = new Map()
  PR: GeneralRegister = new GeneralRegister("PR")

  memory = new Memory()

  labels: Map<string, Label> = new Map()
  assembleResult: AssembleResult = []
  procMap: ProcMap = new Map()

  constructor(input: string, startMemAddress: number) {
    for (let i = 0; i <= 7; i++) {
      const name = `GR${i}`
      this.grMap.set(name, new GeneralRegister(name))
    }
    this.PR.store(startMemAddress)
    const { assembleResult, procMap } = assemble(startMemAddress, input, this.labels, this.FR, this.grMap, this.memory)
    this.assembleResult = assembleResult
    this.procMap = procMap
  }

  step(): boolean {
    const next = this.PR.lookup()
    if (next == -32768) {
      return false
    }
    const row = this.procMap.get(next)
    if (row == null) {
      return false
    }
    row.proc(this.PR)
    return true
  }
}
