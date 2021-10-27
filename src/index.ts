import { CellularAutomaton, ConwaysGameOfLife } from './CellularAutomaton';

const app = document.getElementById('app')

const dilation = 8

const updateCanvas = <T,>(canvas: HTMLCanvasElement, automaton: CellularAutomaton<T>): void => {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    automaton.forCells((x, y) => {
        ctx.beginPath()
        ctx.rect(x * dilation, y * dilation, (x + 1) * dilation, (y + 1) * dilation)
        ctx.fillStyle = automaton.getColor(x, y)
        ctx.fill();
    })
}

const handleCanvasClick = <T,>(canvas: HTMLCanvasElement, automaton: CellularAutomaton<T>) => (e: MouseEvent) => {
    const target = e.target as Element
    const rect = target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    automaton.setValue(Math.floor(x / dilation), Math.floor(y / dilation), automaton.getFull());
    updateCanvas(canvas, automaton)
}

const step = <T,>(canvas: HTMLCanvasElement, automaton: CellularAutomaton<T>) => {
    automaton.doStep()
    updateCanvas(canvas, automaton)
}

let timeoutHandle: number;

const run = <T,>(canvas: HTMLCanvasElement, automaton: CellularAutomaton<T>) => {
    automaton.doStep()
    updateCanvas(canvas, automaton)

    timeoutHandle = window.setTimeout(() => run(canvas, automaton), 100)
}

if (app) {
    const cgol = new ConwaysGameOfLife([100, 100]);

    const canvas = document.createElement('canvas')
    canvas.height = cgol.getSize()[0] * dilation
    canvas.width = cgol.getSize()[1] * dilation
    canvas.onclick = handleCanvasClick(canvas, cgol);
    app.appendChild(canvas)

    const runButton = document.createElement('button')
    runButton.innerText = 'run'
    runButton.onclick = () => run(canvas, cgol)
    app.appendChild(runButton)

    const stopButton = document.createElement('button')
    stopButton.innerText = 'stop'
    stopButton.onclick = () => window.clearTimeout(timeoutHandle)
    app.appendChild(stopButton)

    const forwardButton = document.createElement('button')
    forwardButton.innerText = 'forward'
    forwardButton.onclick = () => step(canvas, cgol)
    app.appendChild(forwardButton)

    const randomizeButton = document.createElement('button')
    randomizeButton.innerText = 'randomize'
    randomizeButton.onclick = () => { cgol.randomize(); updateCanvas(canvas, cgol)}
    app.appendChild(randomizeButton)

    updateCanvas(canvas, cgol)
}
