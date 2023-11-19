import { makeMachine } from "../lib/machine"
import { makeWasmMachine } from "../lib/wasm_machine"

window.casl2 = {
  version: VERSION,
  showWasmResult: false
}

function addClassName(elm, className) {
  const classNames = elm.className.split(" ")
  if (classNames.indexOf(className) == -1) {
    classNames.push(className)
  }
  elm.className = classNames.join(" ")
  return elm
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
  label.innerText = labelText + "#"
  label.htmlFor = id
  let input = document.createElement("input")
  input = addClassName(input, "code")
  input.id = id
  input.type = "text"
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
      v = "#" + v + view.getUint8(1).toString(16).padStart(2, "0")
    }
    if (bytecode.byteLength >= 4) {
      v = v + " "
      v = v + "#" + view.getUint16(2).toString(16).padStart(4, "0")
    }
  }
  return v.toUpperCase()
}

const COLOR = {
  main: "#d9de2f",
  sub: "#a7865a",
  accent: "#f5d942",
  danger: "#dc932a",
  white: "#ffffff",
}

function toHexString(x) {
  return "#" + x.toString(16).padStart(4, "0").toUpperCase()
}

function toBinaryString(x) {
  const s = x.toString(2).padStart(16, "0").toUpperCase()
  return s.slice(0, 4) + " " + s.slice(4, 8) + " " + s.slice(8, 12) + " " + s.slice(12, 16)
}

function component() {
  const globalConf = {
    startAddress: 0x8000,
    displayAddress: 0x8000,
  }

  const assembled = {
    machine: null,
    wasmMachine: null,
    inputText: "",
  }

  function assemble(inputText) {
    console.log("=== ASSEMBLE START ===")
    assembled.inputText = inputText
    const input = inputText.replaceAll("  ", "\t")
    assembled.machine = makeMachine(input, globalConf.startAddress)
    console.log("makeMachine done.")
    console.log(assembled.machine)
    assembled.wasmMachine = makeWasmMachine(input, globalConf.startAddress)
    console.log("makeWasmMachine done.")
    console.log(assembled.wasmMachine)
    console.log("=== ASSEMBLE END ===")
  }

  function step() {
    const hasNext = assembled.machine.step()
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

    let sourceCodeEditor = document.createElement("textarea")
    sourceCodeEditor = addClassName(sourceCodeEditor, "code")
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
    startAddressInput.value = globalConf.startAddress.toString(16)
    startAddressInput.oninput = () => {
      globalConf.startAddress = parseInt("0x" + startAddressInput.value, 16)
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
        assemble(sourceCodeEditor.value.toUpperCase())
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

    let assembleResult = document.createElement("table")
    assembleResult = addClassName(assembleResult, "code")
    assembleResult.id = "assemble_result"
    assembleResult.appendChild(TR(
      TH(""),
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
        TD(operator.startsWith("START") || operator.startsWith("END") ? "" : toHexString(line.memAddress)),
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
        if (toHexString(assembled.machine.PR.lookupLogical()) == address) {
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
      console.time("stepAll_js")
      assembled.machine.stepAll()
      console.timeEnd("stepAll_js")
      console.time("stepAll_wasm")
      assembled.wasmMachine.stepAll()
      console.timeEnd("stepAll_wasm")
      coloring()
      renderMachineStates(machineStateArea)
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
    _renderMachineState(container, "js", assembled.machine)
    if (casl2.showWasmResult) {
      _renderMachineState(container, "wasm", assembled.wasmMachine)
    }
  }

  const _renderMachineState = (container, idPrefix, machine) => {
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

    let prTable = document.createElement("table")
    prTable = addClassName(prTable, "code")
    prTable.appendChild(TR(
      TH("PR"),
      TD(toHexString(machine.PR.lookupLogical())),
    ))
    let grTable = document.createElement("table")
    leftBox.appendChild(prTable)

    grTable = addClassName(grTable, "code")
    for (let gr of ["GR0", "GR1", "GR2", "GR3", "GR4", "GR5", "GR6", "GR7"]) {
      const register = machine.grMap.get(gr)
      grTable.appendChild(TR(
        TH(gr),
        TD(toHexString(register.lookupLogical())),
        addClassName(TD(toBinaryString(register.lookupLogical())), "dashed-border"),
        TD(register.lookup()),
      ))
    }
    leftBox.appendChild(grTable)

    let frTable = document.createElement("table")
    frTable = addClassName(frTable, "code")
    frTable.appendChild(TR(
      TH("FR"),
      TD(machine.FR.of() ? "OF: 1" : "OF: 0"),
      TD(machine.FR.sf() ? "SF: 1" : "SF: 0"),
      TD(machine.FR.zf() ? "ZF: 1" : "ZF: 0"),
    ))
    leftBox.appendChild(frTable)

    let spTable = document.createElement("table")
    spTable = addClassName(spTable, "code")
    spTable.appendChild(TR(
      TH("SP"),
      TD(toHexString(machine.SP.lookupLogical())),
    ))
    leftBox.appendChild(spTable)
    statesBox.appendChild(leftBox)

    const memoryBox = document.createElement("div")
    const [displayAddressLabel, displayAddressInput] = INPUT_ADDRESS("Display from : ", "display_address")
    displayAddressInput.value = globalConf.displayAddress.toString(16)
    displayAddressInput.onchange = () => {
      globalConf.displayAddress = parseInt("0x" + displayAddressInput.value, 16)
      renderMemoryTable(globalConf.displayAddress)
    }
    memoryBox.appendChild(displayAddressLabel)
    memoryBox.appendChild(displayAddressInput)
    function renderMemoryTable(displayAddress) {
      const id = `${idPrefix}_memory_table`
      const target = document.getElementById(id)
      if (target) {
        memoryBox.removeChild(target)
      }
      let memoryTable = document.createElement("table")
      memoryTable = addClassName(memoryTable, "code")
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
      let i = displayAddress;
      const end = i + 8*16
      while (i < end) {
        memoryTable.appendChild(TR(
          TH("#" + i.toString(16)),
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
    renderMemoryTable(globalConf.displayAddress)
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
