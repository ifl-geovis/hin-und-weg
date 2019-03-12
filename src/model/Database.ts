import alasql from "alasql";

export default class Database {

    constructor() {
        alasql("CREATE DATABASE hin_und_weg");
        alasql("USE hin_und_weg");
        this.createMatrixTable();
    }

    public sql(args: any): any {
        return alasql(args);
    }

    protected createMatrixTable(): void {
        alasql("CREATE TABLE matrix (x STRING,y STRING ,z STRING ,value FLOAT);");
    }

}
