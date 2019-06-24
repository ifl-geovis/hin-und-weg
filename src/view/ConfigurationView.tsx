import { Dropdown } from "primereact/dropdown";
import { Panel } from "primereact/panel";

import R from "ramda";
import React from "react";

import FileInput from "./input/FileInput";

import Geodata from "../model/Geodata";
import Tabledata from "../model/Tabledata";

export interface IConfigurationProps
{
	db: alaSQLSpace.AlaSQL;
	geodata: Geodata | null;
	setGeodata: (geodata: Geodata) => void;
	addYear: (year: string) => void;
}

interface IConfigurationState
{
	geoId: string | null;
	geoName: string | null;
	tablefiles: string[];
	geodatafile: string;
}

export default class App extends React.Component<IConfigurationProps, IConfigurationState>
{

	constructor(props: IConfigurationProps)
	{
		super(props);
		this.onSelectGeodataFile = this.onSelectGeodataFile.bind(this);
		this.onSelectTabledataFiles = this.onSelectTabledataFiles.bind(this);
		this.state =
		{
			geoId: "OT",
			geoName: "Name",
			geodatafile: "",
			tablefiles: [],
		};
	}

	public render(): JSX.Element
	{
		let geoFieldOptions;
		if (this.props.geodata)
		{
			geoFieldOptions = R.map((field) => { return { label: field, value: field }; }, this.props.geodata.fields());
		}
		let geodatafile = <div className="p-col-12"/>;
		if (this.state.geodatafile )
		{
			geodatafile = <div className="p-col-8">{this.state.geodatafile}</div>;
		}
		const tablesfiles = R.map((tablefile) => { return (<div key={tablefile} className="p-col-12">{tablefile}</div>); }, this.state.tablefiles);
		return (
			<div>
				<Panel header="1. Geodaten">
					<div className="p-grid p-justify-around">
						<div className="p-col-12">
							<FileInput label="Shape Datei auswählen..." filesSelected={this.onSelectGeodataFile} disabled={false}/>
						</div>
						{geodatafile}
						<Dropdown className="p-col-6" key="geoId" value={this.state.geoId} options={geoFieldOptions} disabled={this.props.geodata == null} placeholder="ID Spalte auswählen" onChange={(e) => {this.setState({geoId: e.value}); } }/>
						<Dropdown className="p-col-6" key="geoName" value={this.state.geoName} options={geoFieldOptions} disabled={this.props.geodata == null} placeholder="Namenspalte auswählen" onChange={(e) => {this.setState({geoName: e.value}); } }/>
					</div>
				</Panel>
				<Panel header="2. Tabellendaten">
					<div className="p-grid">
						<div className="p-col-12">
							<FileInput label={"Tabellendaten hinzufügen..."} filesSelected={this.onSelectTabledataFiles} disabled={false}/>
						</div>
						{tablesfiles}
					</div>
				</Panel>
			</div>
		);
	}

	private onSelectGeodataFile(files: FileList)
	{
		Geodata.read(files[0].path, (newGeodata) => {
			this.props.setGeodata(newGeodata.transformToWGS84());
			this.setState({ geodatafile: files[0].path });
		});
	}

	private onSelectTabledataFiles(files: FileList)
	{
		let newTablefiles = [] as string[];
		for (let i=0;i<files.length; i++)
		{
			const start = files[i].path.length - 8;
			const stop = start + 4;
			const year = files[i].path.substring(start, stop);
			this.addTabledataToDB(year, files[i].path);
			newTablefiles = R.append(files[i].path, newTablefiles);
		}
		this.setState({ tablefiles: R.concat(newTablefiles, this.state.tablefiles) });
	}

	private getNameForId(id: string): string
	{
		if (!this.props.geodata)
		{
			return id;
		}
		const geoId = parseInt(id, 10) % 100;
		const feature = this.props.geodata.getFeatureByFieldValue(this.state.geoId || "OT", `${geoId < 10 ? "0" + geoId : geoId}`);
		if ( feature && feature.properties && this.state.geoName)
		{
			return feature.properties[this.state.geoName];
		}
		else
		{
			return id;
		}
	}

	private addTabledataToDB(year: string, path: string)
	{
		Tabledata.read(path, (tabledata) => {
			const columnHeaders = R.slice(2, tabledata.getColumnCount() - 1, tabledata.getRowAt(3));
			const rowHeaders = R.slice(4, tabledata.getRowCount() - 2, tabledata.getColumnAt(1));
			const columnNames = R.map(this.getNameForId.bind(this), columnHeaders);
			const rowNames = R.map(this.getNameForId.bind(this), rowHeaders);
			const valueMatrix = tabledata.getTabledataBy([4, tabledata.getRowCount() - 2], [2, tabledata.getColumnCount()  - 1]);
			for (let row = 0; row < valueMatrix.getRowCount(); row++)
			{
				for (let column = 0; column < valueMatrix.getColumnCount(); column++)
				{
					const wert = parseInt(valueMatrix.getValueAt(row, column), 10);
					const nach = columnNames[column];
					const von = rowNames[row];
					const jahr = `${year}`;
					this.props.db(`INSERT INTO matrices ('${nach}','${von}','${jahr}', ${isNaN(wert) ? "NULL" : wert});`);
				}
			}
			this.props.addYear(year);
		});
	}

}