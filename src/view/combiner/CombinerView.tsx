import R from "ramda";
import React from "react";
import Select from "react-select";
import Combiner from "../../model/Combiner";
import Geodata from "../../model/Geodata";
import Tabledata from "../../model/Tabledata";
import GeodataView from "../geo/GeodataView";
import FileInput from "../input/FileInput";

export interface ICombinerState {
    combiner: Combiner;
    years: string[];
    froms: string[];
    tos: string[];
}

export default class CombinerView extends React.Component<{}, ICombinerState> {

    constructor(props: {}) {
        super(props);
        this.onSelectGeodataFile = this.onSelectGeodataFile.bind(this);
        this.onAddTabledatas = this.onAddTabledatas.bind(this);
        this.onSelectYears = this.onSelectYears.bind(this);
        this.onSelectFrom = this.onSelectFrom.bind(this);
        this.onSelectTo = this.onSelectTo.bind(this);
        this.state = {
            // TODO: Factor out Id and Selector
            combiner: new Combiner(["Jahr", "Von", "Nach"]).setGeodataId("OT").setGeodataSelector("Name"),
            froms: [],
            tos: [],
            years: [],
        };
    }

    public render() {
        const optionFor = (item: string) => R.assoc("label", item, R.objOf("value", item));
        const yearsOptions = R.map(optionFor, this.state.combiner.getTableNames());
        const fromOptions = R.map(optionFor, this.state.combiner.getRowNamesFor(this.state.years[0]));
        const toOptions = R.map(optionFor, this.state.combiner.getColumnNamesFor(this.state.years[0]));
        const query = {Jahr: this.state.years, Von: this.state.froms, Nach: this.state.tos};
        const results = this.state.combiner.query(query);
        return (
        <div>
            <FileInput label={"Tabellendaten hinzufügen..."} filesSelected={this.onAddTabledatas} disabled={false}/>
            <GeodataView geodata={this.state.combiner.getGeodata()} onSelectGeodata={this.onSelectGeodataFile}/>
            <div> Jahre: <Select options={yearsOptions} onChange={this.onSelectYears} isMulti={true}/></div>
            <div> Von:  <Select options={fromOptions} onChange={this.onSelectFrom} isMulti={true}/></div>
            <div> Nach: <Select options={toOptions} onChange={this.onSelectTo} isMulti={true}/></div>
            <div>
               {R.join(", ", R.map((result) => result.value, results))}
            </div>
        </div>
        );
    }

    private onSelectFrom(selected: any) {
        const selectedFroms = selected as Array<{[value: string]: string}>;
        const newFroms = R.map((selectedFrom) => selectedFrom.value, selectedFroms);
        this.setState({ froms: newFroms});
    }

    private onSelectTo(selected: any) {
        const selectedTos = selected as Array<{[value: string]: string}>;
        const newTos = R.map((selectedTo) => selectedTo.value, selectedTos);
        this.setState({ tos: newTos});
    }

    private onSelectYears(selected: any) {
        const selectedYears = selected as Array<{[value: string]: string}>;
        const newYears = R.map((selectedYear) => selectedYear.value, selectedYears);
        this.setState({ years: newYears });
    }

    private onAddTabledatas(fileList: FileList) {
        for(let i=0; i < fileList.length; i++) {
            Tabledata.read(fileList[i].path, (tableData) => {
                const name = fileList[i].name.substr(-8, 4);
                this.setState( (prevState) => ({
                    // TODO: Factor out row and column Offset
                    combiner: prevState.combiner.addTable("Jahr", name, tableData.getTabledataBy(
                        [3, tableData.getRowCount() - 2], [1, tableData.getColumnCount() - 1],
                    )),
                }));
            });
        }
    }

    private onSelectGeodataFile(file: File) {
        Geodata.read(file.path,(geodata) => {
            this.setState( (prevState) => ({
                combiner: prevState.combiner.setGeodata(geodata),
            }));
        });
    }

}

