import { expect } from "chai";
import { Result } from "cubus";
import R from "ramda";
import * as Debug from "../../src/debug";
import Aggregator, { AggregateData } from "../../src/model/Aggregator";
import Combiner from "../../src/model/Combiner";
import Geodata from "../../src/model/Geodata";
import Tabledata from "../../src/model/Tabledata";

Debug.on();
describe("Aggregator takes Cubus Result(s) data and aggregates it.", () => {

    const combiner = new Combiner(["Jahr", "Von", "Nach"]);

    beforeEach((done) => {
        const addTable = (year: number) => {
            const table = Tabledata.readSync(`./testdata/Leipzig-OT Umzüge_${year}.csv`);
            combiner.addTable("Jahr", `${year}`, table.getTabledataBy([3, table.getRowCount() - 2], [1, table.getColumnCount() - 1]));
        };
        Geodata.read("./testdata/ot.shp", (geodata: Geodata) => {
            combiner.setGeodata(geodata)
                    .setGeodataId("OT")
                    .setGeodataSelector("Name");
            R.forEach(addTable, R.range(2002, 2017));
            done();
        });
    });

    it("One dimension aggregates", () => {
        expect(Aggregator.create("Anzahl").aggregate(combiner.query({Jahr: ["2002"]}))).equal(3969);
        expect(Aggregator.create("Anzahl").aggregate(combiner.query({Jahr: ["2010"]}))).equal(3969);
    });

    it("One dimension aggregates to saldi", () => {
        const saldi = Aggregator.create("Saldo").aggregate(combiner.query({Jahr: ["2002"]})) as AggregateData;
        expect(saldi[0].value).equal(0);
        // expect(Aggregator.create("Saldo").aggregate(combiner.query({Jahr: ["2010"]}))).deep.equal(3969);
    });


    it("Year dimensions aggregates 'Anzahl' ", () => {
        expect(Aggregator.create("Anzahl").aggregate(combiner.query({Jahr: ["2002", "2003"]}))).equal(3969 * 2);
        expect(Aggregator.create("Anzahl").aggregate(combiner.query({Jahr: ["2010", "2011" , "2012"]}))).equal(3969 * 3);
    });

    it("Year dimensions aggregates 'Mittelwert'", () => {
        expect(Aggregator.create("Mittelwert").aggregate(combiner.query({Jahr: ["2002", "2003"]}))).equal(17.814493211240922);
        expect(Aggregator.create("Mittelwert").aggregate(combiner.query({Jahr: ["2010", "2011" , "2012"]}))).equal(16.663168145423068);
    });

    it("Year dimensions aggregates 'Differenz'", () => {
        const diffs = Aggregator.createForGrouping("Differenz", "Jahr")
            .aggregate(combiner.query({Jahr: ["2002", "2003"]})) as Array<Result<number>>;
        const values = R.map((result) => result.value, diffs);
        expect(values).deep.equal([0]);
    });
});


