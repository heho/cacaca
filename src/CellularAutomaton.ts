export type CellBlock<T> = T[][]

export abstract class CellularAutomaton<T> {
    private size: [number, number]
    private cells: CellBlock<T> = []

    constructor(size: [number, number]) {
        this.size = size;

        for (let i = 0; i < size[0]; i++) {
            this.cells.push([])
            for (let j = 0; j < size[1]; j++) {
                this.cells[i].push(this.getEmpty())
            }
        }
    }

    public getValue(x: number, y:number): T { return this.cells[(this.size[0] + x) % this.size[0]][(this.size[1] + y) % this.size[1]] }

    public setValue(x: number, y:number, v: T): void { this.cells[x % this.size[0]][y % this.size[1]] = v }

    public abstract valueToColor(v: T): string

    public getColor(x: number, y:number): string { return this.valueToColor(this.getValue(x, y)) }

    public getSize(): [number, number] { return this.size }

    public abstract getEmpty(): T
    public abstract getFull(): T
    public abstract mult(x: T, y: number): number
    public abstract add(x: T, y: number): number
    public abstract getKernel(): number[][]
    public abstract growthMapping(x: number): number
    public abstract stateMapping(x: number): T
    public abstract random(): T

    public randomize() {
        this.forCells((x, y) => this.setValue(x, y, this.random()))
    }

    public forCells (f: (x: number, y: number) => void) {
        for (let i = 0; i < this.size[0]; i++)
            for (let j = 0; j < this.size[1]; j++)
                f(i, j)
    }

    public doStep(): void {
        const convolution: number[][] = []
        const nextCells: T[][] = []
        const kernel = this.getKernel()
        const offset = [Math.floor(kernel.length / 2), Math.floor(kernel[0].length / 2)]

        // At := current cells
        // K := Kernel
        // C = At * K
        for (let i = 0; i < this.size[0]; i++) {
            convolution.push([])
            for (let j = 0; j < this.size[1]; j++) {
                let sum = 0

                for (let oi = -offset[0]; oi <= offset[0]; oi++) {
                    for (let oj = -offset[1]; oj <= offset[1]; oj++) {
                        const cv = kernel[oi + offset[0]][oj + offset[1]]
                        const v = this.getValue(i + oi, j + oj)
                        sum += this.mult(v, cv)
                    }
                }

                convolution[i].push(sum)
            }
        }

        // A(t+1) = M(At + G(C))
        for (let i = 0; i < this.size[0]; i++) {
            nextCells.push([])
            for (let j = 0; j < this.size[1]; j++) {
                nextCells[i].push(
                    this.stateMapping(
                        this.add(this.getValue(i, j), this.growthMapping(convolution[i][j]))
                    )
                )
            }
        }

        this.cells = nextCells
    }

}

type ConwayState = 0 | 1

export class ConwaysGameOfLife extends CellularAutomaton<ConwayState> {
    valueToColor = (v: ConwayState): string => v === 0 ? 'black' : 'white'
    private kernel = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
    ]

    getEmpty(): ConwayState { return 0 }
    getFull(): ConwayState { return 1 }
    mult(x: ConwayState, y: number): number { return x * y }
    add(x: ConwayState, y: number): number { return x + y }
    random(): ConwayState { return Math.random() < 0.5 ? 0 : 1 }

    getKernel(): number[][] { return this.kernel }

    growthMapping(x: number): number {
        if (x < 2) return -1
        if (x === 2) return 0
        if (x === 3) return 1
        return -1
    }

    stateMapping(x: number): ConwayState {
        return x >= 1 ? 1 : 0
    }
}