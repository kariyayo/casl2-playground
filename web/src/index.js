import { makeMachine } from "../lib/machine"
import { makeWasmMachine } from "../lib/wasm_machine"

window.casl2 = {
  version: VERSION,
  showWasmResult: false
}

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

function INPUT_ADDRESS(labelText, id) {
  const label = document.createElement("label")
  label.innerText = labelText
  label.htmlFor = id
  const input = document.createElement("input")
  input.id = id
  input.type = "number"
  input.min = 0
  input.max = 9000
  input.step = 8
  return [label, input]
}

function displayOpecode(bytecode) {
  let v = ""
  if (bytecode != null) {
    const view = new DataView(bytecode)
    if (bytecode.byteLength >= 2) {
      v = view.getUint8(0).toString(16).padStart(2, "0")
      v = "0x" + v + view.getUint8(1).toString(16).padStart(2, "0")
    }
    if (bytecode.byteLength >= 4) {
      v = v + " "
      v = v + "0x" + view.getUint16(2).toString(16).padStart(4, "0")
    }
  }
  return v
}

const COLOR = {
  main: "#d9de2f",
  sub: "#a7865a",
  accent: "#f5d942",
  danger: "#dc932a",
  white: "#ffffff",
}

function toHexString(x) {
  return "0x" + x.toString(16).padStart(4, "0")
}

function component() {
  const globalConf = {
    startAddress: 2000,
  }

  const assembled = {
    machine: null,
    wasmMachine: null,
    inputText: "",
  }

  function assemble(inputText) {
    console.log("=== ASSEMBLE START ===")
    console.log("startAddress: ", globalConf.startAddress)
    assembled.inputText = inputText
    const input = inputText.replaceAll("  ", "\t")
    console.log("-----")
    console.log(input)
    console.log("-----")
    assembled.machine = makeMachine(input, globalConf.startAddress)
    console.log("makeMachine done.")
    console.log(assembled.machine)
    assembled.wasmMachine = makeWasmMachine(input, globalConf.startAddress)
    console.log("makeWasmMachine done. result=" + assembled.wasmMachine)
    console.log(assembled.wasmMachine)
    console.log("=== ASSEMBLE END ===")
  }

  function step() {
    const hasNext = assembled.machine.step()
    console.log("-----")
    console.log("ok currentPos=" + assembled.machine.PR.lookupLogical())
    console.log("-----")
    const res = assembled.wasmMachine.step()
    return hasNext
  }

  const sample = `SAMPLE	START
	LD	GR1,A
	LD	GR2,B
	ADDA	GR1,GR2
	ST	GR1,C
	RET
A	DC	3
B	DC	5
C	DS	1
	END`

  const renderInputArea = (container, assembleResultArea, machineStateArea) => {
    container.appendChild(H2("Input source code"))

    const sourceCodeEditor = document.createElement("textarea")
    sourceCodeEditor.cols = 80
    sourceCodeEditor.rows = 20
    sourceCodeEditor.onkeydown = (event) => {
      if (event.keyCode == 9 || event.key == "Tab" || event.keyCode == 32 || event.key == "") {
        event.preventDefault()
        const pos = sourceCodeEditor.selectionStart
        const left = sourceCodeEditor.value.substr(0, pos)
        const right = sourceCodeEditor.value.substr(pos, sourceCodeEditor.value.length)
        sourceCodeEditor.value = left + "\t" + right
        sourceCodeEditor.selectionEnd = pos+1
      }
    }
    sourceCodeEditor.innerHTML = sample
    sourceCodeEditor.autofocus = true
    sourceCodeEditor.selectionStart = sourceCodeEditor.value.length
    sourceCodeEditor.selectionEnd = sourceCodeEditor.selectionStart
    container.appendChild(sourceCodeEditor)

    const globalConfBox = document.createElement("div")
    const [startAddressLabel, startAddressInput] = INPUT_ADDRESS("Start address : ", "input_text_start_address")
    startAddressInput.value = globalConf.startAddress
    startAddressInput.oninput = () => {
      globalConf.startAddress = Number(startAddressInput.value)
    }
    globalConfBox.appendChild(startAddressLabel)
    globalConfBox.appendChild(startAddressInput)
    container.appendChild(globalConfBox)

    const assembleErrorMessage = document.createElement("p")
    assembleErrorMessage.style.fontSize = "1.2rem"
    assembleErrorMessage.style.fontWeight = "bold"
    assembleErrorMessage.style.color = COLOR.danger
    container.appendChild(assembleErrorMessage)

    const assembleButton = document.createElement("button")
    assembleButton.textContent = "Assemble"
    assembleButton.onclick = () => {
      try {
        assembleErrorMessage.innerText = ""
        assemble(sourceCodeEditor.value)
      } catch(e) {
        let errorMessage = e.message
        if (e.tokens) {
          errorMessage = "L" + (e.tokens.lineNum + 1) + ": " + e.message
        }
        assembleErrorMessage.innerText = errorMessage
        alert(errorMessage)
        throw e
      }
      renderAssembleResultArea(assembleResultArea, machineStateArea)
      renderMachineStates(machineStateArea)
    }
    container.appendChild(assembleButton)
  }

  const renderAssembleResultArea = (container, machineStateArea) => {
    container.innerHTML = ""

    const assembleResultHeader = H2("Assemble result")
    assembleResultHeader.ondblclick = () => {
      casl2.showWasmResult = !casl2.showWasmResult
      renderMachineStates(machineStateArea)
    };
    container.appendChild(assembleResultHeader)

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
      const operator = line.tokens.operator
      assembleResult.appendChild(TR(
        TD(line.tokens.lineNum),
        TD(displayOpecode(line.bytecode)),
        TD(operator.startsWith("START") || operator.startsWith("END") ? "" : line.memAddress),
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
      renderMachineStates(machineStateArea)
    }

    const stepOverButton = document.createElement("button")
    stepOverButton.textContent = "Step over"
    stepOverButton.onclick = () => {
      const hasNext = step()
      if (hasNext) {
        coloring()
        renderMachineStates(machineStateArea)
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
          renderMachineStates(machineStateArea)
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

  const renderMachineStates = (container) => {
    container.innerHTML = ""
    renderMachineState(container, "js", assembled.machine)
    if (casl2.showWasmResult) {
      renderMachineState(container, "wasm", assembled.wasmMachine)
    }
  }

  const renderMachineState = (container, idPrefix, machine) => {
    console.log(machine)
    if (casl2.showWasmResult) {
      container.appendChild(H2(`Machine states ( ${idPrefix} )`))
    } else {
      container.appendChild(H2(`Machine states`))
    }
    const statesBox = document.createElement("div")
    statesBox.id = `${idPrefix}_machine_states`
    statesBox.style.display = "flex"
    statesBox.style.justifyContent = "space-between"

    const leftBox = document.createElement("div")
    const grTable = document.createElement("table")
    grTable.appendChild(TR(
      TH("PR"),
      TD(machine.PR.lookupLogical()),
    ))
    for (let gr of ["GR1", "GR2", "GR3", "GR4", "GR5", "GR6", "GR7"]) {
      grTable.appendChild(TR(
        TH(gr),
        TD(machine.grMap.get(gr).lookup()),
      ))
    }
    leftBox.appendChild(grTable)

    const frTable = document.createElement("table")
    frTable.appendChild(TR(
      TH("FR"),
      TD(machine.FR.of() ? "OF: 1" : "OF: 0"),
      TD(machine.FR.sf() ? "SF: 1" : "SF: 0"),
      TD(machine.FR.zf() ? "ZF: 1" : "ZF: 0"),
    ))
    leftBox.appendChild(frTable)

    const spTable = document.createElement("table")
    spTable.appendChild(TR(
      TH("SP"),
      TD(machine.SP.lookupLogical()),
    ))
    leftBox.appendChild(spTable)
    statesBox.appendChild(leftBox)

    const memoryBox = document.createElement("div")
    const [displayAddressLabel, displayAddressInput] = INPUT_ADDRESS("Display from : ", "display_address")
    displayAddressInput.value = globalConf.startAddress
    displayAddressInput.onchange = () => {
      console.log(Number(displayAddressInput.value))
      renderMemoryTable(Number(displayAddressInput.value))
    }
    memoryBox.appendChild(displayAddressLabel)
    memoryBox.appendChild(displayAddressInput)
    function renderMemoryTable(startAddress) {
      const id = `${idPrefix}_memory_table`
      const target = document.getElementById(id)
      if (target) {
        memoryBox.removeChild(target)
      }
      const memoryTable = document.createElement("table")
      memoryTable.id = id
      memoryTable.appendChild(TR(
        TH("address"),
        TH(""),
        TH(""),
        TH(""),
        TH(""),
        TH(""),
        TH(""),
        TH(""),
        TH(""),
      ))
      let i = startAddress;
      const end = i + 8*16
      while (i < end) {
        memoryTable.appendChild(TR(
          TH(i.toString()),
          TD(toHexString(machine.memory.lookupLogical(i++))),
          TD(toHexString(machine.memory.lookupLogical(i++))),
          TD(toHexString(machine.memory.lookupLogical(i++))),
          TD(toHexString(machine.memory.lookupLogical(i++))),
          TD(toHexString(machine.memory.lookupLogical(i++))),
          TD(toHexString(machine.memory.lookupLogical(i++))),
          TD(toHexString(machine.memory.lookupLogical(i++))),
          TD(toHexString(machine.memory.lookupLogical(i++))),
        ))
      }
      memoryBox.appendChild(memoryTable)
    }
    renderMemoryTable(globalConf.startAddress)
    statesBox.appendChild(memoryBox)
    container.appendChild(statesBox)
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


function hoge(input) {
  const length = input.length
  const bytePerElement = Module.HEAPU16.BYTES_PER_ELEMENT
  const arrayPointer = Module._malloc(length * bytePerElement)
  Module.HEAPU16.set(input, arrayPointer / bytePerElement)

  const result = Module.ccall(
    'runInterPreter',
    ['number', 'number'],
    [arrayPointer, length],
  )
}
