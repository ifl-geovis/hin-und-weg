import { expect } from "chai";
import * as Debug from "../../src/debug";
import Database from "../../src/model/Database";
import Geodata from "../../src/model/Geodata";
import Tabledata from "../../src/model/Tabledata";

Debug.on();

describe("Use a SQL Database for analysis of table/matrix data", () => {

    let db: Database;

    beforeEach(() => {
        db = new Database();
    });

    it("Has matrix table", () => {
       expect(db).is.not.equal(null);
       const result = db.sql("SELECT * FROM matrix;");
       expect(result.length).is.equal(0);
    });
});
