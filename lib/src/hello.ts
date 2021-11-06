import { Commet2, makeMachine } from "./machine"

console.log("Hello!")

const controllerText = `
REI1001	START
				LD		GR1,A
				LD		GR2,B
				ADDA	GR1,GR2
				ST		GR1,C
				RET
A				DC		3
B				DC		5
C				DS		1
				END
`

function display(machine: Commet2) {
  console.log(machine.PR.lookup())
}

console.log("=== START ===")
const machine = makeMachine(controllerText, 2000)
display(machine)
while(machine.step()) {
  display(machine)
}
console.log("=== END ===")