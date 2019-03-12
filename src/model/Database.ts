import alasql from "alasql";
import Tabledata from "./Tabledata";

export default class Database {

    constructor() {
        alasql("CREATE DATABASE hin_und_weg");
        alasql("USE hin_und_weg");
        this.createMatricesTable();
    }

    public sql(args: any): any {
        return alasql(args);
    }

    public addToMatrices(zValue: string, data: Tabledata, getValueForId: (id: number) => string = (id: number ) => `$id`): boolean {
        try{
            for(let row = 0; row < data.getRowCount(); row++){
                for (let column = 0; column < data.getColumnCount(); column++) {
                    const value = parseFloat(data.getValueAt(row, column));
                    const x = getValueForId(row);
                    const y = getValueForId(column);
                    alasql(`INSERT INTO TABLE matrices (${x}, ${y}, ${zValue}, ${value});`);
                }
            }
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    protected createMatricesTable(): void {
        alasql("CREATE TABLE matrices (x STRING,y STRING ,z STRING ,val FLOAT);");
    }

}
