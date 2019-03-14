
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Panel } from "primereact/panel";
import { ScrollPanel } from "primereact/scrollpanel";
import { TabPanel, TabView } from "primereact/tabview";

import alasql from "alasql";
import R from "ramda";
import React from "react";

import Geodata from "../model/Geodata";
import Tabledata from "../model/Tabledata";

import ChartsView from "./charts/ChartsView";
import TableView from "./db/TableView";
import GeodataView from "./geo/GeodataView";

import FileInput from "./input/FileInput";

export interface IAppProps {
    db: alaSQLSpace.AlaSQL;
}

interface IAppState {
    geodata: Geodata | null;
    years: string[];
}

export default class App extends React.Component<IAppProps, IAppState> {

    constructor(props: IAppProps) {
        super(props);
        this.onSelectGeodataFile = this.onSelectGeodataFile.bind(this);
        this.onSelectTabledataFiles = this.onSelectTabledataFiles.bind(this);
        this.state = {
            geodata: null,
            years: [],
        };
    }

    public render(): JSX.Element {
        let results = [];
        if (this.state.years.length > 0) {
            results = this.props.db("SELECT * FROM matrices;");
        }
        return (
            <div className="p-grid">
                <Panel header="Headerpanel" className="p-col-12"></Panel>
                <div className="p-col-4">
                    <div className="p-grid">
                        <Panel header="Themen" className="p-col-12">
                            <Button label="Von"/>
                            <Button label="Nach"/>
                            <Button label="Saldi"/>
                        </Panel>
                        <Panel header="Jahre" className="p-col-12">
                            {R.map((year) => <Checkbox onChange={console.log} value={year} key={year}>{year}</Checkbox>, this.state.years)}
                        </Panel>
                    </div>
                </div>
                <TabView className="p-col-8 p-tabview-right">
                    <TabPanel header="Karte">
                        <ScrollPanel style={{width: "100%", height: "850px"}}>
                            <GeodataView  geodata={this.state.geodata} onSelectGeodata={this.onSelectGeodataFile}/>
                        </ScrollPanel>
                    </TabPanel>
                    <TabPanel header="Tabelle">
                        <TableView items={results}/>
                    </TabPanel>
                    <TabPanel header="Diagramme">
                        <ChartsView items={[]}/>
                    </TabPanel>
                    <TabPanel header="Verwaltung">
                        <FileInput label={"Tabellendaten hinzufügen..."} filesSelected={this.onSelectTabledataFiles} disabled={false}/>
                    </TabPanel>
                </TabView>
            </div>
        );
    }

    private onSelectGeodataFile(file: File) {
        Geodata.read(file.path, (newGeodata) => {
            this.setState({geodata: newGeodata.transformToWGS84() });
        });
    }

    private onSelectTabledataFiles(files: FileList) {
        for (let i=0;i<files.length; i++) {
            const start = files[i].path.length - 8;
            const stop = start + 4;
            const year = files[i].path.substring(start, stop);
            this.addTabledataToDB(year, files[i].path);
        }
    }

    //  Model part:
    //  ----------------------------------------------------------------

    private getNameForId = (id: string): string => {
        if (!this.state.geodata) {
            return id;
        }
        const geoId = parseInt(id, 10) % 100;
        const feature = this.state.geodata.getFeatureByFieldValue("OT", `${geoId < 10 ? "0" + geoId : geoId}`);
        if ( feature && feature.properties && feature.properties.Name) {
            return feature.properties.Name;
        } else {
            return id;
        }
    };

    private addTabledataToDB(year: string, path: string) {
        Tabledata.read(path, (tabledata) => {
            const columnHeaders = R.slice(2, tabledata.getColumnCount() - 1, tabledata.getRowAt(3));
            const rowHeaders = R.slice(4, tabledata.getRowCount() - 2, tabledata.getColumnAt(1));
            const columnNames = R.map(this.getNameForId.bind(this), columnHeaders);
            const rowNames = R.map(this.getNameForId.bind(this), rowHeaders);
            const valueMatrix = tabledata.getTabledataBy([4, tabledata.getRowCount() - 2], [2, tabledata.getColumnCount()  - 1]);
            for (let row = 0; row < valueMatrix.getRowCount(); row++) {
                for (let column = 0; column < valueMatrix.getColumnCount(); column++) {
                    const value = parseInt(valueMatrix.getValueAt(row, column), 10);
                    const x = columnNames[column];
                    const y = rowNames[row];
                    const z = `${year}`;
                    this.props.db(`INSERT INTO matrices ('${x}','${y}','${z}', ${isNaN(value) ? "NULL" : value});`);
                }
            }
            const newYears = this.state.years;
            newYears.push(year);
            this.setState({
                 years: newYears,
            });
        });
    }
}
