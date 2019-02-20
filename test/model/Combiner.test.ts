import { expect } from "chai";
import * as Debug from "../../src/debug";
import Combiner from "../../src/model/Combiner";
import Geodata from "../../src/model/Geodata";
import Tabledata from "../../src/model/Tabledata";

Debug.on();

describe("Combiner takes Geodata and Tabledata and combines Geodata fields and Matrix cells", () => {

    let combiner: Combiner;

    beforeEach((done) => {
        Geodata.read("./testdata/ot.shp", (geodata: Geodata) => {
            combiner = new Combiner(geodata,["Jahr","Von","Nach"]);
            combiner.setGeodataId("OT").setGeodataSelector("Name");
            done();
        });
    });

    it("Is created with Geodata and Table dimensions", () => {
        expect(combiner).not.equals(null);
        expect(combiner.getTableCount()).is.equal(0);
    });

    it("Can add Tabledata and provides Table names, rowNames, columnNames",(done) => {
        const name = "./testdata/Leipzig-OT Umzüge_2002.csv";
        Tabledata.read(name, (tabledata) => {
            combiner.addTable("Jahr", "2002", tabledata.getTabledataBy(
                    [ 3, tabledata.getRowCount() - 2], [1, tabledata.getColumnCount() - 1],
            ));
            expect(combiner.getTableCount()).is.equal(1);
            expect(combiner.getTableNames()).is.deep.equal(["2002"]);
            expect(combiner.getRowNamesFor("2002")).length(63,"Row names length should be 63");
            expect(combiner.getRowNamesFor("2002")).contains("Zentrum-Nordwest").and.contains("Zentrum-Ost");
            expect(combiner.getColumnNamesFor("2002")).length(63,"Column names length should be 63");
            expect(combiner.getColumnNamesFor("2002")).contains("Zentrum-Südost").and.contains("Zentrum-Süd");
            done();
        });
    });

    it("Can query by all dimensions",(done) => {
        const name = "./testdata/Leipzig-OT Umzüge_2002.csv";
        Tabledata.read(name,(tabledata) => {
            combiner.addTable("Jahr", "2002", tabledata.getTabledataBy(
                [3, tabledata.getRowCount() - 2],[1, tabledata.getColumnCount() - 1]
            ));
            const year2002 = combiner.query({Jahr: ["2002"]});
            expect(year2002).length(63 * 63);
            expect(year2002[0].value).equal(32);
            expect(year2002[0].property[0].name).equal("Jahr");
            expect(year2002[0].property[0].value).equal("2002");
            expect(year2002[0].property[1].name).equal("Von");
            expect(year2002[0].property[1].value).equal("Zentrum");
            expect(year2002[0].property[2].name).equal("Nach");
            expect(year2002[0].property[2].value).equal("Zentrum");
            expect("Not implemented","Convert Result to Tabledata ?").equal("Is implemented");
            done();
        });
    });
})