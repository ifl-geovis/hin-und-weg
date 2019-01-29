import R from 'ramda'
import assert from 'assert'
import fs from 'fs'

export default class Tabledata {

    private data: string[][]
    
    private static createTabledata = function(err:NodeJS.ErrnoException,data:string): Tabledata {        
        let rows = R.reject(R.isEmpty,data.split(/\n|\r\n/)) as string[]        
        let cells = R.map(R.split(/;|,|:/),rows)        
        return new Tabledata(cells)
    }

    public static read(path: string,callback: (data: Tabledata) => void){
        fs.readFile(path,{encoding:"UTF-8"},R.pipe(Tabledata.createTabledata,callback))
    }

    constructor(data: string[][]){     
        this.data = data           
    }

    public getCellCount():number {
        return this.getRowCount()*this.getColumnCount()
    }

    public getRowCount():number {
        return this.data.length
    }

    public getColumnCount():number {
        return this.data[0].length
    }

    public getRowAt(index: number): string[]{
        return this.data[index]
    }

    public getColumnAt(index: number): string[]{
        let nth = (row: string[]): string => {
            return R.defaultTo("",R.nth(index,row))
        }
        return R.map(nth,this.data)        
    }

    public getValueAt(rowIndex: number,columnIndex: number): string {
        return R.defaultTo("",R.nth(columnIndex,this.getRowAt(rowIndex)))
    }
}