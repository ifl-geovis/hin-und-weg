
import { Checkbox } from "primereact/checkbox";
import { Panel } from "primereact/panel";
import { ScrollPanel } from "primereact/scrollpanel";
import { TabPanel, TabView } from "primereact/tabview";

import R from "ramda";
import React from "react";

import Geodata from "../model/Geodata";

import ChartsView from "./charts/ChartsView";
import ConfigurationView from "./ConfigurationView";
import DBView from "./DBView";
import GeodataView from "./geo/GeodataView";
import Themes from "./Themes";
import Years from "./Years";
import TableView from "./TableView";

export interface IAppProps {
    db: alaSQLSpace.AlaSQL;
}

interface IAppState {
    geodata: Geodata | null;
    yearsAvailable: string[];
    years: string[];
    location: string | null;
    theme: string;
}

export default class App extends React.Component<IAppProps, IAppState> {

    constructor(props: IAppProps) {
        super(props);
        this.state = {
            geodata: null,
            location: null,
            theme: "Von",
            years: [],
            yearsAvailable: [],
        };
    }

    public render(): JSX.Element {
        const results = this.query();
        return (
            <div className="p-grid">
                <div className="p-col-2">
                    <div className="p-grid p-justify-around">
                        <div className="p-col-12"><Themes themes={["Von", "Nach", "Saldi"]}
                                selected={ this.state.theme} setTheme={(newTheme) => this.setState({ theme: newTheme})}/>
                        </div>
                        <div className="p-col-12"><Years availableYears={this.state.yearsAvailable} selected={this.state.years}
                               setYears={(newYears) => this.setState({years: newYears})}/>
                        </div>
                    </div>
                </div>
                <div className="p-col-10">
                    <TabView className="p-tabview-right" activeIndex={3}>
                        <TabPanel header="Karte">
                                <GeodataView geodata={this.state.geodata} items={results}
                                             onSelectLocation={(newLocation) => this.setState({location: newLocation})}
                                             selectedLocation={this.state.location} />
                        </TabPanel>
                        <TabPanel header="Tabelle">
                            <TableView items={results} maxRows={20}/>
                        </TabPanel>
                        <TabPanel header="Diagramm">
                            <ChartsView items={results} />
                        </TabPanel>
                        <TabPanel header="Verwaltung">
                            <ConfigurationView db={this.props.db} geodata={this.state.geodata}
                                addYear={(year) => {
                                    this.setState({ yearsAvailable: R.uniq(R.append(year, this.state.yearsAvailable)) });
                                }}
                                setGeodata={(newGeodata) => { this.setState({ geodata: newGeodata }); }} />
                        </TabPanel>
                        <TabPanel header="Datenbank ">
                            <DBView db={this.props.db} />
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        );
    }

    private query(): any[] {
        let results: any[] = [];
        if ( R.or(R.isNil(this.state.location), R.isEmpty(this.state.yearsAvailable)) ) {
            return results;
        }
        const years = R.isEmpty(this.state.years) ? this.state.yearsAvailable : this.state.years;
        const stringYears =  R.join(", ", R.map((year) => `'${year}'`, years));
        const location = ` ${this.state.theme} IN ('${this.state.location}') `;
        let query = "";
        if ( this.state.theme === "Von") {
            query = `SELECT '${this.state.location}' as Von, Nach, SUM(Wert) as Wert FROM matrices ` +
                    `WHERE ${location} AND Jahr IN (${stringYears}) ` +
                    `GROUP BY Nach `;
        } else if ( this.state.theme === "Nach") {
            query = `SELECT Von, '${this.state.location}' as Nach, SUM(Wert) as Wert FROM matrices ` +
                    `WHERE ${location} AND Jahr IN (${stringYears}) ` +
                    `GROUP BY Von `;
        } else if ( this.state.theme === "Saldi") {
            query = "SELECT * FROM matrices;";
        }
        console.log("Query: ", query);
        results = this.props.db(query);
        return results;
    }
}
