import { makeMachine } from "../lib/machine"

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

const COLOR = {
  main: "#f5d942",
  sub: "#a7865a",
  accent: "#d9de2f",
  danger: "#dc932a",
  white: "#ffffff",
}

function component() {
  const globalConf = {
    startAddress: 2000,
  }

  const assembled = {
    machine: null,
    inputText: "",
  }

  function assemble(inputText) {
    console.log("=== ASSEMBLE START ===")
    assembled.inputText = inputText
    try {
      assembled.machine = makeMachine(inputText.replaceAll("  ", "\t"), globalConf.startAddress)
    } catch (e) {
      alert(e)
      throw e
    }
    console.log("=== ASSEMBLE END ===")
    console.log(assembled.machine.assembleResult)
  }

  function step() {
    const hasNext = assembled.machine.step()
    return hasNext
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
    container.innerHTML = ""

    container.appendChild(H2("Assemble result"))

    const assembleResult = document.createElement("table")
    assembleResult.id = "assemble_result"
    assembleResult.appendChild(TR(
      TH("#"),
      TH("opecode"),
      TH("address"),
      TH(""),
      TH(""),
      TH(""),
    ))
    for (let line of assembled.machine.assembleResult) {
      assembleResult.appendChild(TR(
        TD(line.tokens.lineNum),
        TD(displayOpecode(line.bytecode)),
        TD(line.tokens.lineNum == 0 ? "" : line.memAddress),
        TD(line.tokens.label),
        TD(line.tokens.operator),
        TD(line.tokens.operand),
      ))
    }
    container.appendChild(assembleResult)

    function coloring() {
      const rows = document.querySelectorAll("#assemble_result tr")
      rows.forEach((row, i) => {
        if (i == 0) return
        const address = row.querySelectorAll("td").item(2).innerText
        if (assembled.machine.PR.lookupLogical() == address) {
          row.style.backgroundColor = COLOR.accent
        } else {
          row.style.backgroundColor = null
        }
      })
    }

    const resetButton = document.createElement("button")
    resetButton.textContent = "Reset"
    resetButton.onclick = () => {
      assemble(assembled.inputText)
      renderAssembleResultArea(container, machineStateArea)
      renderMachineState(machineStateArea)
    }

    const stepOverButton = document.createElement("button")
    stepOverButton.textContent = "Step over"
    stepOverButton.onclick = () => {
      const hasNext = step()
      if (hasNext) {
        coloring()
        renderMachineState(machineStateArea)
      } else {
        stepOverButton.disabled = true
        runButton.disabled = true
      }
    }

    const runButton = document.createElement("button")
    runButton.textContent = "Run"
    runButton.onclick = () => {
      let hasNext = true
      const intervalId = setInterval(() => {
        hasNext = step()
        if (hasNext) {
          coloring()
          renderMachineState(machineStateArea)
        } else {
          clearInterval(intervalId)
        }
      }, 500)
      stepOverButton.disabled = true
      runButton.disabled = true
    }

    container.appendChild(stepOverButton)
    container.appendChild(runButton)
    container.appendChild(resetButton)

    coloring()
  }

  const renderMachineState = (container) => {
    console.log(assembled.machine)
    container.innerHTML = ""

    container.appendChild(H2("Machine states"))
    const grTable = document.createElement("table")

    grTable.appendChild(TR(
      TH("PR"),
      TD(assembled.machine.PR.lookupLogical()),
    ))

    for (let gr of ["GR0", "GR1", "GR2", "GR3", "GR4", "GR5", "GR6", "GR7"]) {
      grTable.appendChild(TR(
        TH(gr),
        TD(assembled.machine.grMap.get(gr).lookupLogical()),
      ))
    }
    container.appendChild(grTable)

    const frTable = document.createElement("table")
    frTable.appendChild(TR(
      TH("FR"),
      TD(assembled.machine.FR.of() ? "OF: 1" : "OF: 0"),
      TD(assembled.machine.FR.sf() ? "SF: 1" : "SF: 0"),
      TD(assembled.machine.FR.zf() ? "ZF: 1" : "ZF: 0"),
    ))
    container.appendChild(frTable)

    const spTable = document.createElement("table")
    spTable.appendChild(TR(
      TH("SP"),
      TD(assembled.machine.SP.lookupLogical()),
    ))
    container.appendChild(spTable)

    const memoryTable = document.createElement("table")
    memoryTable.appendChild(TR(
      TH("#"),
      TH(""),
      TH(""),
      TH(""),
      TH(""),
      TH(""),
      TH(""),
      TH(""),
      TH(""),
    ))
    let i = globalConf.startAddress;
    const end = i + 8*16
    while (i < end) {
      memoryTable.appendChild(TR(
        TH(i.toString()),
        TD(assembled.machine.memory.lookupLogical(i++).toString(16).padStart(4, "0")),
        TD(assembled.machine.memory.lookupLogical(i++).toString(16).padStart(4, "0")),
        TD(assembled.machine.memory.lookupLogical(i++).toString(16).padStart(4, "0")),
        TD(assembled.machine.memory.lookupLogical(i++).toString(16).padStart(4, "0")),
        TD(assembled.machine.memory.lookupLogical(i++).toString(16).padStart(4, "0")),
        TD(assembled.machine.memory.lookupLogical(i++).toString(16).padStart(4, "0")),
        TD(assembled.machine.memory.lookupLogical(i++).toString(16).padStart(4, "0")),
        TD(assembled.machine.memory.lookupLogical(i++).toString(16).padStart(4, "0")),
      ))
    }
    container.appendChild(memoryTable)
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
