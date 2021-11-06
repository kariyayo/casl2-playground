import { Commet2, makeMachine } from "../lib/machine"

function H2(text) {
  const header = document.createElement("h2")
  header.innerText = text
  return header
}

function TH(text) {
  const element = document.createElement("th")
  element.innerText = text
  return element
}

function TD(text) {
  const element = document.createElement("td")
  element.innerText = text
  return element
}

function TR(...elms) {
  const row = document.createElement("tr")
  for (let elm of elms) {
    row.appendChild(elm)
  }
  return row
}

function displayOpecode(bytecode) {
  let v = ""
  if (bytecode != null) {
    const view = new DataView(bytecode)
    if (bytecode.byteLength >= 2) {
      v = view.getUint8(0).toString(16).padStart(2, "0")
      v = v + view.getUint8(1).toString(16).padStart(2, "0")
    }
    if (bytecode.byteLength >= 4) {
      v = v + " "
      v = v + view.getUint16(2).toString(16).padStart(4, "0")
    }
  }
  return v
}

function component() {
  let machine = null

  const assemble = (inputText) => {
    console.log("=== ASSEMBLE START ===")
    machine = makeMachine(inputText.replaceAll("  ", "\t"), 2000)
    console.log("=== ASSEMBLE END ===")
  }

  const step = () => {
    const ok = machine.step()
    if (ok) {
      console.log(machine)
    }
  }

  const run = (inputText) => {
    console.log("=== START ===")
    const machine = makeMachine(inputText.replaceAll("  ", "\t"), 2000)
    console.log(machine.assembleResult)
    console.log(machine)
    while(machine.step()) {
      console.log(machine)
    }
    console.log("=== END ===")
    return machine
  }

  const sample = `SAMPLE	START
				LD		GR1,A
				LD		GR2,B
				ADDA	GR1,GR2
				ST		GR1,C
				RET
A				DC		3
B				DC		5
C				DS		1
				END`

  const renderInputArea = (container, assembleResultArea, machineStateArea) => {
    container.appendChild(H2("Input source code"))

    const input = document.createElement("textarea")
    input.cols = 80
    input.rows = 20
    input.innerHTML = sample
    container.appendChild(input)

    const assembleButton = document.createElement("button")
    assembleButton.textContent = "Assemble"
    assembleButton.onclick = () => {
      assemble(input.value)
      renderAssembleResultArea(assembleResultArea, machineStateArea)
      renderMachineState(machineStateArea)
    }
    container.appendChild(assembleButton)
  }

  const renderAssembleResultArea = (container, machineStateArea) => {
    console.log(machine.assembleResult)
    container.innerHTML = ""

    container.appendChild(H2("Assemble result"))

    const assembleResult = document.createElement("table")
    assembleResult.appendChild(TR(
      TH("#"),
      TH("address"),
      TH("opecode"),
      TH(""),
      TH(""),
      TH(""),
    ))
    for (let line of machine.assembleResult) {
      assembleResult.appendChild(TR(
        TD(line.tokens.lineNum),
        TD(line.memAddress),
        TD(displayOpecode(line.bytecode)),
        TD(line.tokens.label),
        TD(line.tokens.operator),
        TD(line.tokens.operand),
      ))
    }
    container.appendChild(assembleResult)

    const runButton = document.createElement("button")
    runButton.textContent = "Run"
    runButton.onclick = () => {
      step()
      renderMachineState(machineStateArea)
    }
    container.appendChild(runButton)
  }

  const renderMachineState = (container) => {
    console.log(machine)
    container.innerHTML = ""

    container.appendChild(H2("Machine states"))
    const grTable = document.createElement("table")

    grTable.appendChild(TR(
      TH("PR"),
      TD(machine.PR.lookupLogical()),
    ))

    for (let gr of ["GR0", "GR1", "GR2", "GR3", "GR4", "GR5", "GR6", "GR7"]) {
      grTable.appendChild(TR(
        TH(gr),
        TD(machine.grMap.get(gr).lookupLogical()),
      ))
    }
    container.appendChild(grTable)

    grTable.appendChild(TR(
      TH("FR"),
      TD(machine.FR.toString()),
    ))

    grTable.appendChild(TR(
      TH("SP"),
      TD(machine.SP.lookupLogical()),
    ))
  }

  return {
    render: () => {
      const container = document.createElement("div")

      const inputArea = document.createElement("div")
      const assembleResultArea = document.createElement("div")
      const machineStateArea = document.createElement("div")

      renderInputArea(inputArea, assembleResultArea, machineStateArea)

      container.appendChild(inputArea)
      container.appendChild(assembleResultArea)
      container.appendChild(machineStateArea)
      return container
    }
  }
}

document.getElementById("app").appendChild(component().render())
