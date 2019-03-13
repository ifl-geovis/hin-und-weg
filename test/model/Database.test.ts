import alasql from "alasql";
import { expect } from "chai";
import R from "ramda";
import * as Debug from "../../src/debug";
import Geodata from "../../src/model/Geodata";
import Tabledata from "../../src/model/Tabledata";

Debug.on();
describe("Use a SQL Database for analysis of table/matrix data", () => {

    let db: alaSQLSpace.AlaSQL;
    let geodata: Geodata;

    const getNameForId = (id: string): string => {
        const geoId = parseInt(id, 10) % 100;
        const feature = geodata.getFeatureByFieldValue("OT", `${geoId < 10 ? "0" + geoId : geoId}`);
        if ( feature && feature.properties && feature.properties.Name) {
            return feature.properties.Name;
        } else {
            return id;
        }
    };

    const addTabledataToDB = (year: string, path: string) => {
        const tabledata = Tabledata.readSync(path);
        const columnHeaders = R.slice(2, tabledata.getColumnCount() - 1, tabledata.getRowAt(3));
        const rowHeaders = R.slice(4, tabledata.getRowCount() - 2, tabledata.getColumnAt(1));
        const columnNames = R.map(getNameForId, columnHeaders);
        const rowNames = R.map(getNameForId, rowHeaders);
        const valueMatrix = tabledata.getTabledataBy([4, tabledata.getRowCount() - 2],[2, tabledata.getColumnCount()  - 1]);
        for (let row = 0; row < valueMatrix.getRowCount(); row++) {
            for (let column = 0; column < valueMatrix.getColumnCount(); column++) {
                const value = parseInt(valueMatrix.getValueAt(row, column), 10);
                const x = columnNames[column];
                const y = rowNames[row];
                const z = `${year}`;
                db(`INSERT INTO matrices ('${x}','${y}','${z}', ${isNaN(value) ? "NULL" : value});`);
            }
        }
    };

    before( function(done) {
        this.timeout(30000);
        db = alasql;
        db("CREATE DATABASE hin_und_weg");
        db("USE hin_und_weg");
        db("CREATE TABLE matrices (x STRING,y STRING ,z STRING ,val FLOAT);");
        Geodata.read("./testdata/ot.shp", (ots) => {
            geodata = ots;
            R.forEach((year) => addTabledataToDB(`${year}`, `./testdata/Leipzig-OT Umzüge_${year}.csv`), R.range(2002, 2018));
            done();
        });
    });

    it("Has matrices table", () => {
       expect(db).is.not.equal(null);
       const result = db("SELECT * FROM matrices;");
       expect(result.length).is.equal(3969 * 16);
       expect(result[23].x).is.equal("Reudnitz-Thonberg");
       expect(result[23].y).is.equal("Zentrum");
       expect(result[23].z).is.equal("2002");
       expect(result[23].val).is.equal(18);
    });

    it("Can query values", () => {
        const result = db("SELECT * FROM matrices WHERE y = 'Zentrum' AND x = 'Zentrum-Ost' AND z = '2002';");
        expect(result.length).is.equal(1);
        expect(result[0].y).is.equal("Zentrum");
        expect(result[0].x).is.equal("Zentrum-Ost");
        expect(result[0].z).is.equal("2002");
        expect(result[0].val).is.equal(11);
     });

    it("Can query sum of from migrations", () => {
         let result = db("SELECT SUM(val) as mig_sum FROM matrices WHERE y = 'Schönefeld-Ost' AND z = '2002';");
         expect(result.length).is.equal(1);
         expect(result[0].mig_sum).is.equal(651);
         result = db("SELECT SUM(val) as mig_sum FROM matrices WHERE y = 'Schönefeld-Ost' AND z >= '2002' AND z <= '2005';");
         expect(result[0].mig_sum).is.equal(2656);
    });

    it("Can query saldi ", () => {
        const tos = db("SELECT z as year, SUM(val) as to_mig FROM matrices WHERE x = 'Zentrum' AND val != 'NaN' GROUP BY z; ");
        const froms = db("SELECT z as year, SUM(val) as from_mig FROM matrices WHERE y = 'Zentrum' AND val != 'NaN' GROUP BY z; ");
        const saldi = [];
        for (let i = 0; i < froms.length; i++) {
            saldi.push(R.objOf(froms[i].year, tos[i].to_mig - froms[i].from_mig));
        }
        console.log(saldi);
   });
});
