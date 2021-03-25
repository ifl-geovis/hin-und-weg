import assert from "assert";
import Cubus from "cubus";
import fs from "fs";
import R from "ramda";

// TODO: Maybe use an own builded assert module
const notNilOrEmpty = (data: string|string[][]) => R.and(R.not(R.isNil(data)), R.not(R.isEmpty(data)));

// TODO: Add typesafe Tabledata with generics
/**
 * Represents tabledata as matrix of cells. The cells will be adressed by rows and columns.
 * Additionally it provides a conversion to a OLAP [https://de.wikipedia.org/wiki/OLAP-W%C3%BCrfel]
 * datastructure.
 */
export default class Tabledata {

    // TODO: Add cases for load different files (not only csv), depending on file suffixes
    // - Maybe add a CSVLoader, Excelloader, DBF loader
    public static read(path: string, callback: (data: Tabledata) => void): void {
        assert(notNilOrEmpty(path), "path should not be nil or undefined");
        fs.exists(path, (exists) => assert(exists, `File with path ${path} should exists`));
        //@ts-ignore
        fs.readFile(path, {encoding: "utf-8"}, R.pipe(Tabledata.createTabledataFromCSV, callback));
    }

    public static readSync(path: string): Tabledata {
        assert(notNilOrEmpty(path), "path should not be nil or undefined");
        fs.exists(path, (exists) => assert(exists, `File with path ${path} should exists`));
        return Tabledata.createTabledataFromCSV( {} as Error, fs.readFileSync(path, {encoding: "utf-8"}));
    }

    private static createTabledataFromCSV(err: NodeJS.ErrnoException, data: string): Tabledata {
        assert(notNilOrEmpty(data), "data should not be nil or undefined");
        const rows = R.reject(R.isEmpty, data.split(/\n|\r\n/)) as string[];
        const cells = R.map(R.split(/;|,|:/), rows);
        return new Tabledata(cells);
    }

    private data: string[][];

    constructor(data: string[][]) {
        assert(notNilOrEmpty(data), "data should not be nil or undefined");
        this.data = data;
    }

    public getCellCount(): number {
        return this.getRowCount() * this.getColumnCount();
    }

    public getRowCount(): number {
        return this.data.length;
    }

    public getColumnCount(): number {
        assert(this.data.length > 0, "data should has a length > 0");
        return this.data[0].length;
    }

    public getRowAt(index: number): string[] {
        assert(index >= 0 && index < this.getRowCount(), `index should between 0 and ${this.getRowCount()} (exclusive)`);
        return this.data[index];
    }

    public getColumnAt(index: number): string[]{
        assert(index >= 0 && index < this.getColumnCount(), `index should between 0 and ${this.getColumnCount()} (exclusive)`);
        const nth = (row: string[]): string => {
            return R.defaultTo("", R.nth(index, row));
        }
        return R.map(nth, this.data);
    }

    public getValueAt(rowIndex: number, columnIndex: number): string {
        assert(rowIndex >= 0 && rowIndex < this.getRowCount(), `rowIndex should between 0 and ${this.getRowCount()} (exclusive)`);
        assert(columnIndex >= 0 && columnIndex < this.getColumnCount(),
              `columnIndex should between 0 and ${this.getColumnCount()} (exclusive)`);
        return R.defaultTo("", R.nth(columnIndex, this.getRowAt(rowIndex)));
    }

    public getTabledataBy(rowStartEnd: [number,number],columnStartEnd: [number,number]): Tabledata {
        assert(rowStartEnd[0] >=0 && rowStartEnd[0] <= rowStartEnd[1] && rowStartEnd[1] <= this.getRowCount(),
            `rowStartEnd[0] should between 0 and rowStartEnd[1] and rowStartEnd[1] should between rowStartEnd[0] ` +
            `and ${this.getRowCount()} (exclusive)`);
        let cells = new Array<string[]>();
        for (let rowIndex = rowStartEnd[0]; rowIndex < rowStartEnd[1]; rowIndex++) {
            let row = new Array<string>();
            for (let columnIndex = columnStartEnd[0]; columnIndex < columnStartEnd[1]; columnIndex++){
                row = R.append(this.getValueAt(rowIndex,columnIndex), row);
            }
            cells = R.append(row, cells);
        }
        return new Tabledata(cells);
    }

    public getOLAPMatrixFor(tableName: string, tableValue: string, rowName: string, columnName: string): Cubus<string> {
        assert(notNilOrEmpty(tableName), "tableName should not be nil or undefined");
        assert(notNilOrEmpty(tableValue), "tableValue should not be nil or undefined");
        assert(notNilOrEmpty(rowName), "rowName should not be nil or undefined");
        assert(notNilOrEmpty(columnName), "columnName should not be nil or undefined");
        assert(R.length(R.keys(R.reduce((obj, key: string) => R.assoc(key, "", obj), {}, [tableName, tableValue, rowName, columnName])))
                === 4,
                "Parameter values (tableName etc) should be different");
        const rowKeys = R.tail(this.getRowAt(0));
        const columnKeys = R.tail(this.getColumnAt(0));
        const matrixTable = this.getTabledataBy([1, this.getRowCount()], [1, this.getColumnCount()]);

        const dimensions = [tableName, rowName, columnName];
        const cubus = new Cubus<string>(dimensions);
        cubus.addDimensionValue(tableName, tableValue);
        R.forEach((row) => cubus.addDimensionValue(rowName, row), rowKeys);
        R.forEach((column) => cubus.addDimensionValue(columnName, column), columnKeys);
        R.forEach((row) => {
            R.forEach((column) => {
                const value = matrixTable.getValueAt(rowKeys.indexOf(row), columnKeys.indexOf(column));
                const address = R.assoc(columnName, column, R.assoc(rowName, row, R.objOf(tableName,tableValue)));
                cubus.add(value, address);
            }, columnKeys);
        }, rowKeys);
        return cubus;
    }
}
