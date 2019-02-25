import Cubus, { Query, Result } from "cubus";
import R from "ramda";
import Geodata from "../../src/model/Geodata";
import Tabledata from "../../src/model/Tabledata";

export default class Combiner {

    private geodata: Geodata | null;
    private cubus: Cubus<number>;
    private tableDimensions: string[];
    private tables: { [name: string]: Tabledata };
    private geodataId: string = "ID";
    private geodataSelector: string = "Name";

    constructor(tableDimensions: string[]) {
        this.geodata = null;
        this.tables = {};
        this.tableDimensions = tableDimensions;
        this.cubus = new Cubus<number>(tableDimensions);
    }

    public setGeodata(geodata: Geodata): Combiner {
        this.geodata = geodata;
        return this;
    }

    public getColumnNamesFor(name: string): string[] {
        if (R.or(R.isEmpty(this.tables), R.isNil(this.tables[name]))) {
            return [];
        }
        return R.map(this.getNameById.bind(this), R.tail(this.tables[name].getRowAt(0)));
    }

    public addTable(dimension: string, name: string, table: Tabledata): Combiner {
        this.tables = R.assoc(name, table, this.tables);

        this.cubus.addDimensionValue(dimension, name);
        if (this.getTableCount() < 2) {
            R.forEach((rowName) => this.cubus.addDimensionValue(dimension[1], rowName), this.getRowNamesFor(name));
            R.forEach((columnName) => this.cubus.addDimensionValue(dimension[2], columnName),
                        this.getColumnNamesFor(name));
        }

        for (let row = 1; row < table.getRowCount(); row++){
            const rowName = this.getNameById(table.getColumnAt(0)[row]);
            for (let column = 1; column < table.getColumnCount(); column++){
                const columnName = this.getNameById(table.getRowAt(0)[column]);
                const value = parseFloat(table.getValueAt(row,column));
                let address = R.objOf(dimension, name);
                address = R.assoc(this.tableDimensions[1], rowName, address);
                address = R.assoc(this.tableDimensions[2], columnName, address);
                this.cubus.add(value, address);
            }
        }
        return this;
    }

    public getGeodata(): Geodata | null {
        return this.geodata;
    }

    public getTableCount(): number {
        return R.length(this.getTableNames());
    }

    public query(query: Query): Array<Result<number>> {
        return this.cubus.query(query);
    }

    public setGeodataId(id: string): Combiner {
        this.geodataId = id;
        return this;
    }

    public getGeodataId(): string {
        return this.geodataId;
    }

    public setGeodataSelector(selector: string): Combiner {
        this.geodataSelector = selector;
        return this;
    }

    public getGeodataSelector(): string {
        return this.geodataSelector;
    }

    public getValueFor(tableSpec: [string,string], rowSpec: [string,string], columnSpec: [string, string]): number {
        const selectedRowKey = this.getCubusKeyFor(rowSpec[1]);
        const selectedColumnKey = this.getCubusKeyFor(columnSpec[1]);
        const request = R.objOf(tableSpec[0], tableSpec[1]);
        const query = R.assoc(columnSpec[0], [selectedColumnKey], R.assoc(rowSpec[0], [selectedRowKey], request));
        return this.cubus.query(query)[0].value;
    }

    public getTableNames(): string[] {
        return R.sort(( a, b ) => a.localeCompare(b), R.keys(this.tables) as string[]);
    }

    public getRowNamesFor(name: string): string[] {
        if (R.or(R.isEmpty(this.tables),R.isNil(this.tables[name]))) {
            return [];
        }
        return R.map(this.getNameById.bind(this), R.tail(this.tables[name].getColumnAt(0)));
    }

    protected normalizeValue(value: string): string {
        const newValue = value.substr(-2);
        if (newValue.length === 1){
            return "0" + newValue;
        }
        return newValue;
    }

    private getNameById(id: string): string{
        if(this.geodata == null || this.geodataId == null || this.getGeodataSelector == null) {
            return id;
        }
        try {
            const feature = this.geodata.getFeatureByFieldValue(this.getGeodataId(), this.normalizeValue(id));
            return feature.properties![this.getGeodataSelector()];
        } catch (error) {
            return id;
        }
    }

    private getCubusKeyFor(selector: string): string {
        if (this.geodata == null){
            return selector;
        }
        const selectedFeature = this.geodata.getFeatureByFieldValue(this.geodataSelector, selector);
        // TODO: How can we factor out this ?
        return "" + parseInt(selectedFeature.properties![this.geodataId], 10);
    }
}
