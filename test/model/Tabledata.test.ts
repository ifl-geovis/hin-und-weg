import { expect } from "chai";
import R from "ramda";
import * as Debug from "../../src/debug";
import Tabledata from "../../src/model/Tabledata";

Debug.on();

describe("Load tabledata from csv and provide access to rows and columns", () => {

    it("Load csv as tabledata ", (done) => {
        Tabledata.read("./testdata/201512_OT_4_2a_Bereinigt.csv", (data: Tabledata) => {
            expect(data.getCellCount()).equal(64 * 64);
            done();
        });
    });

    it("Load csv and getting rows and columns", (done) => {
        Tabledata.read("./testdata/201512_OT_4_2a_Bereinigt.csv", (data: Tabledata) => {
            expect(data.getRowCount()).equal(64);
            expect(data.getColumnCount()).equal(64);
            expect(data.getRowAt(0)).has.length(64);
            expect(R.slice(0,10,data.getRowAt(0))).has.members((["", "0", "1", "2", "3", "4", "5", "6", "10", "11"]));
            expect(data.getColumnAt(0)).has.length(64);
            expect(R.slice(0,10,data.getColumnAt(0))).has.members((["", "0", "1", "2", "3", "4", "5", "6", "10", "11"]));
            done();
        });
    });

    it("Load csv and getting value at row and column", (done) => {
        Tabledata.read("./testdata/201512_OT_4_2a_Bereinigt.csv", (data: Tabledata) => {
            expect(data.getValueAt(23,23)).equal("23");
            expect(data.getValueAt(42,42)).equal("115");
            expect(data.getValueAt(34,11)).equal(".");
            done();
        });
    });

    it("Create a tabledata from regions", (done) => {
        Tabledata.read("./testdata/201512_OT_4_2a_Bereinigt.csv", (data: Tabledata) => {
            const subTable = data.getTabledataBy([1, 64], [1, 64]);
            expect(subTable.getRowCount()).equal(63);
            expect(subTable.getColumnCount()).equal(63);
            expect(subTable.getValueAt(0,0)).equal("29");
            expect(subTable.getValueAt(62,62)).equal("96");
            expect(subTable.getValueAt(42,25)).equal("5");
            done();
        });
    });

    it("Create a OLAP Matrix from Tabledata", (done) => {
        Tabledata.read("./testdata/201512_OT_4_2a_Bereinigt.csv", (data: Tabledata) => {
            const cubus = data.getOLAPMatrixFor("Jahr", "2015", "Von", "Nach");
            expect(cubus.query({Jahr: ["2015"], Von: ["0"], Nach:["0"]})[0].value).equal("29");
            expect(cubus.query({Von: ["52"], Nach: ["50"]})[0].value).equal("25");
            done();
        });
    });
});
