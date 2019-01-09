
interface Matrix {

    getRowCount(): number
    getColumnCount(): number
    getRowAt(rowNum: number): number[]
    getColumnAt(columnNum: number): number[]
    getValueAt(rowNum: number, columnNum:number): number
    getCells(): number[][]

}
// Implementation of Matrix
import * as fs from "fs"

class CSVMatrix implements Matrix {

    cells: Array<Array<number>>
    offsets:[number,number] // row,col

    constructor(csvFilePath: string,offsets:[number,number]=[1,1],rowSeparator:RegExp = /[\r]\n/,columnSeparator:RegExp = /;/) { 
        this.offsets = offsets
        let csvContent = fs.readFileSync(csvFilePath,"UTF-8").toString()
        this.cells = new Array<Array<number>>()
        let rows = csvContent.split(rowSeparator)
        for(let row of rows){
            let newRow = new Array<number>()
            let columns = row.split(columnSeparator)
            for(let column of columns){   
                newRow.push(parseInt(column))
            }
            this.cells.push(newRow)
        }
    }

    getRowCount(): number {
        return this.cells.length-this.offsets[0]-1
    }

    getColumnCount(): number {
        return this.cells[0].length-this.offsets[1]
    }

    getRowAt(rowNum: number): number[] {
        return this.cells[rowNum+this.offsets[0]]
    }

    getColumnAt(columnNum: number): number[] {
        return this.cells.map((row) => row[columnNum+this.offsets[1]])
    }

    getValueAt(rowNum: number, columnNum:number): number {
        return this.cells[rowNum+this.offsets[0]][columnNum+this.offsets[1]]
    }

    getCells(): number[][] {
        return this.cells
    }
}

export { Matrix }
export { CSVMatrix }