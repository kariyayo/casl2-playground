import { Commet2, makeMachine } from "../lib/machine"

function component() {
  const display = (machine) => {
    console.log(machine.PR.lookup())
  }
  const start = (inputText) => {
    console.log("=== START ===")
    const machine = makeMachine(inputText.replaceAll("  ", "\t"), 2000)
    console.log(machine.assembleResult)
    display(machine)
    while(machine.step()) {
      display(machine)
    }
    console.log("=== END ===")
    return machine
  }

  const sample = `REI1001	START
				LD		GR1,A
				LD		GR2,B
				ADDA	GR1,GR2
				ST		GR1,C
				RET
A				DC		3
B				DC		5
C				DS		1
				END`

  return {
    render: () => {
      const container = document.createElement("div")

      const inputArea = document.createElement("div")
      const input = document.createElement("textarea")
      input.cols = 80
      input.rows = 20
      input.innerHTML = sample
      inputArea.appendChild(input)
      container.appendChild(inputArea)

      const button = document.createElement("button")
      button.textContent = "Run"
      button.onclick = () => {
        start(input.value)
      }
      container.appendChild(button)

      return container
    }
  }
}

document.getElementById("app").appendChild(component().render())
