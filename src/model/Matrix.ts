
interface IMatrix {

    getRowCount(): number;
    getColumnCount(): number;
    getRowAt(rowNum: number): number[];
    getColumnAt(columnNum: number): number[];
    getValueAt(rowNum: number, columnNum: number): number;
    getCells(): number[][];

}
// Implementation of Matrix
import * as fs from "fs";

class CSVMatrix implements IMatrix {

    private cells: number[][];
    private offsets: [number, number]; // row,col

    constructor(csvFilePath: string,offsets:[number, number] = [1, 1], rowSeparator: RegExp = /[\r]\n/,columnSeparator: RegExp = /;/) {
        this.offsets = offsets;
        const csvContent = fs.readFileSync(csvFilePath,"UTF-8").toString();
        this.cells = new Array<Array<number>>();
        const rows = csvContent.split(rowSeparator);
        for(const row of rows) {
            const newRow = new Array<number>();
            const columns = row.split(columnSeparator);
            for (const column of columns) {
                newRow.push(parseInt(column, 10));
            }
            this.cells.push(newRow);
        }
    }

    public getRowCount(): number {
        return this.cells.length - this.offsets[0] - 1;
    }

    public getColumnCount(): number {
        return this.cells[0].length - this.offsets[1];
    }

    public getRowAt(rowNum: number): number[] {
        return this.cells[rowNum + this.offsets[0]];
    }

    public getColumnAt(columnNum: number): number[] {
        return this.cells.map((row) => row[columnNum + this.offsets[1]]);
    }

    public getValueAt(rowNum: number, columnNum: number): number {
        return this.cells[rowNum + this.offsets[0]][columnNum + this.offsets[1]];
    }

    public getCells(): number[][] {
        return this.cells;
    }
}

export { IMatrix };
export { CSVMatrix };