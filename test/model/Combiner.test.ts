import { expect } from "chai";
import * as Debug from "../../src/debug";
import Combiner from "../../src/model/Combiner";
import Geodata from "../../src/model/Geodata";
import Tabledata from "../../src/model/Tabledata";

Debug.on();
describe("Combiner takes Geodata and Tabledata and combines Geodata fields and Matrix cells", () => {

    const combiner = new Combiner(["Jahr", "Von", "Nach"]);

    beforeEach((done) => {
        Geodata.read("./testdata/ot.shp", (geodata: Geodata) => {
            combiner.setGeodata(geodata)
                    .setGeodataId("OT")
                    .setGeodataSelector("Name");
            Tabledata.read("./testdata/Leipzig-OT Umzüge_2002.csv", (tabledata) => {
                combiner.addTable("Jahr", "2002", tabledata.getTabledataBy(
                            [3, tabledata.getRowCount() - 2], [1, tabledata.getColumnCount() - 1]
                ));
            });
            done();
        });
    });

    it("Is created with Geodata and Table dimensions", () => {
        expect(combiner).not.equals(null);
        expect(combiner.getTableCount()).is.equal(0);
    });

    it("Can add Tabledata and provides Table names, rowNames, columnNames", () => {
        expect(combiner.getTableCount()).is.equal(1);
        expect(combiner.getTableNames()).is.deep.equal(["2002"]);
        expect(combiner.getRowNamesFor("2002")).length(63,"Row names length should be 63");
        expect(combiner.getRowNamesFor("2002")).contains("Zentrum-Nordwest").and.contains("Zentrum-Ost");
        expect(combiner.getColumnNamesFor("2002")).length(63,"Column names length should be 63");
        expect(combiner.getColumnNamesFor("2002")).contains("Zentrum-Südost").and.contains("Zentrum-Süd");
    });

    it("Can query by all dimensions", () => {
        const year2002 = combiner.query({Jahr: ["2002"]});
        expect(year2002).length(63 * 63);
        expect(year2002[0].value).equal(32);
        expect(year2002[0].property[0].name).equal("Jahr");
        expect(year2002[0].property[0].value).equal("2002");
        expect(year2002[0].property[1].name).equal("Von");
        expect(year2002[0].property[1].value).equal("Zentrum");
        expect(year2002[0].property[2].name).equal("Nach");
        expect(year2002[0].property[2].value).equal("Zentrum");
        expect(combiner.getValueFor(["Jahr", "2002"], ["Von", "Zentrum"], ["Nach", "Zentrum"])).equal(32);
    });

    it("Can aggregate by one dimension", () => {
        expect(combiner.aggregate("Summe", {Jahr: ["2002"]} )).equal(56891);
        expect(combiner.aggregate("Anzahl", {Jahr: ["2002"]} )).equal(3969);
        expect(combiner.aggregate("Mittelwert", {Jahr: ["2002"]} )).equal(17.89587920729789);
        expect(combiner.aggregate("Medianwert", {Jahr: ["2002"]} )).equal(6);
        expect(combiner.aggregate("Minimum", {Jahr: ["2002"]} )).equal(0);
        expect(combiner.aggregate("Maximum", {Jahr: ["2002"]} )).equal(976);
    });

});
