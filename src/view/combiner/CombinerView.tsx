import { Result } from "cubus";
import R from "ramda";
import React from "react";

import Combiner from "../../model/Combiner";
import Geodata from "../../model/Geodata";
import Tabledata from "../../model/Tabledata";
import ChartsView from "../charts/ChartsView";
import GeodataView from "../geo/GeodataView";
import CombinerConfigView from "./CombinerConfigView";
import CubusResultView from "./CubusResultView";

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
        this.onSelectFroms = this.onSelectFroms.bind(this);
        this.onSelectTos = this.onSelectTos.bind(this);
        this.onSelectGeoId = this.onSelectGeoId.bind(this);
        this.onSelectGeoName = this.onSelectGeoName.bind(this);
        this.state = {
            combiner: new Combiner(["Jahr", "Von", "Nach"]),
            froms: [],
            tos: [],
            years: [],
        };
    }

    public render() {
        const combiner = this.state.combiner;
        const query = {Jahr: this.state.years, Von: this.state.froms, Nach: this.state.tos};
        const geodata = combiner.getGeodata() == null ? null : combiner.getGeodata()!.transformToWGS84();
        const results = combiner.query(query);
        const resultsView = this.createResultsViewFrom(results);
        return (
            <div>
                <GeodataView geodata={geodata} onSelectGeodata={this.onSelectGeodataFile}/>
                <CombinerConfigView combiner={this.state.combiner}
                    onAddTabledatas={this.onAddTabledatas}
                    onSelectYears={this.onSelectYears}
                    onSelectFroms={this.onSelectFroms}
                    onSelectTos={this.onSelectTos}
                    onSelectGeoId={this.onSelectGeoId}
                    onSelectGeoName={this.onSelectGeoName}
                />
                <div>{resultsView}</div>
            </div>
        );
    }

    protected createResultsViewFrom(results: Array<Result<number>>): JSX.Element[] {
        const createYearTable = (year: string): JSX.Element => {
            const yearResults = R.filter((result) => result.property[0].value === year, results);
            return (
                <div key={year}>
                    <h3>{year}</h3>
                    <CubusResultView results={yearResults}/>
                    <ChartsView datas={yearResults}/>
                </div>
            );
        };
        return R.map(createYearTable, this.state.years);
    }

    private onSelectFroms(selected: string[]) {
        this.setState({ froms: selected});
    }

    private onSelectTos(selected: string[]) {
        this.setState({ tos: selected});
    }

    private onSelectYears(selected: string[]) {
        this.setState({ years: selected });
    }

    private onSelectGeoId(geoId: string) {
        this.setState( (prevState) => ({
            combiner: prevState.combiner.setGeodataId(geoId),
        }));
    }

    private onSelectGeoName(geoName: string) {
        this.setState( (prevState) => ({
            combiner: prevState.combiner.setGeodataSelector(geoName),
        }));
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
        Geodata.read(file.path, (geodata) => {
            this.setState( (prevState) => ({
                combiner: prevState.combiner.setGeodata(geodata),
            }));
        });
    }

}

