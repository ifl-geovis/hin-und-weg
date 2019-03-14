
import alasql from "alasql";
import * as React from "react";
import * as ReactDOM from "react-dom";
import AppView from "./view/App";

function setupDB() {
    const DB = alasql;
    DB("CREATE DATABASE hin_und_weg");
    DB("USE hin_und_weg");
    DB("CREATE TABLE matrices (x STRING,y STRING ,z STRING ,val FLOAT);");
    return DB;
}

ReactDOM.render(<AppView db={setupDB()}/>, document.getElementById("root"));
