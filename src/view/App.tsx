
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Panel } from "primereact/panel";
import { ScrollPanel } from "primereact/scrollpanel";
import { TabPanel, TabView } from "primereact/tabview";

import R from "ramda";
import React from "react";

import Geodata from "../model/Geodata";

import ChartsView from "./charts/ChartsView";
import ConfigurationView from "./ConfigurationView";
import GeodataView from "./geo/GeodataView";
import QueryView from "./QueryView";

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
                <Panel header="Status" className="p-col-12">
                </Panel>
                <div className="p-col-2">
                    <div className="p-grid p-justify-around">
                        <Panel header="Themen" className="p-col-12">
                            <Button label="Von"/>
                            <Button label="Nach"/>
                            <Button label="Saldi"/>
                        </Panel>
                        <Panel header="Jahre" className="p-col-12">
                            {R.map((year) =>
                                <div key={year} className="p-p-col-12">{year}<Checkbox onChange={console.log} value={year}/></div>,
                                this.state.years)}
                        </Panel>
                    </div>
                </div>
                <TabView className="p-col-10 p-tabview-right" activeIndex={3}>
                    <TabPanel header="Karte">
                        <ScrollPanel style={{width: "100%", height: "850px"}}>
                            <GeodataView geodata={this.state.geodata}/>
                        </ScrollPanel>
                    </TabPanel>
                    <TabPanel header="Tabelle">
                        <QueryView db={this.props.db}/>
                    </TabPanel>
                    <TabPanel header="Diagramme">
                        <ChartsView items={[]}/>
                    </TabPanel>
                    <TabPanel header="Verwaltung">
                        <ConfigurationView db={this.props.db} geodata={this.state.geodata}
                                           addYear={(year) => { this.setState({ years: R.append(year, this.state.years ) }); } }
                                           setGeodata={(newGeodata) => { this.setState({geodata: newGeodata}); }} />
                    </TabPanel>
                </TabView>
            </div>
        );
    }
}
