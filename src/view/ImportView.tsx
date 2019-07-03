import { Dropdown } from "primereact/dropdown";
import { Panel } from "primereact/panel";

import R from "ramda";
import React from "react";

import FileInput from "./input/FileInput";

import Geodata from "../model/Geodata";
import Tabledata from "../model/Tabledata";
import TableFileStatus from "../data/TableFileStatus";

export interface IImportProps
{
	db: alaSQLSpace.AlaSQL;
	geodata: Geodata | null;
	geoId: string | null;
	geoName: string | null;
	setGeodata: (geodata: Geodata) => void;
	setGeoName: (geoName: string) => void;
	setGeoId: (geoId: string) => void;
	addYear: (year: string) => void;
}

interface IImportState
{
	tablefiles: TableFileStatus[];
	geodatafile: string;
}

export default class ImportView extends React.Component<IImportProps, IImportState>
{

	constructor(props: IImportProps)
	{
		super(props);
		this.onSelectGeodataFile = this.onSelectGeodataFile.bind(this);
		this.onSelectTabledataFiles = this.onSelectTabledataFiles.bind(this);
		this.state =
		{
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
		const tablesfiles = R.map((tablefile) => { return this.formatTableStatus(tablefile); }, this.state.tablefiles);
		return (
			<div>
				<Panel header="1. Geodaten">
					<div className="p-grid p-justify-around">
						<div className="p-col-12">
							<FileInput label="Shape Datei auswählen..." filesSelected={this.onSelectGeodataFile} disabled={false}/>
						</div>
						{geodatafile}
						<div className="p-col-3">ID-Attribut auswählen:</div>
						<Dropdown className="p-col-3" key="geoId" value={this.props.geoId} options={geoFieldOptions} disabled={this.props.geodata == null} placeholder="ID Spalte auswählen" onChange={(e) => {this.props.setGeoId(e.value); } }/>
						<div className="p-col-3">Namens-Attribut auswählen:</div>
						<Dropdown className="p-col-3" key="geoName" value={this.props.geoName} options={geoFieldOptions} disabled={this.props.geodata == null} placeholder="Namenspalte auswählen" onChange={(e) => {this.props.setGeoName(e.value); } }/>
					</div>
				</Panel>
				<Panel header="2. Tabellendaten" style={((this.props.geodata == null) || (this.props.geoId == null) || (this.props.geoName == null) || (this.props.geodata.fields().indexOf(this.props.geoId) < 0)) ? {display: "none"} : {display: "block"}}>
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
		let newTablefiles = [] as TableFileStatus[];
		for (let i=0;i<files.length; i++)
		{
			let status: TableFileStatus = new TableFileStatus(files[i].path)
			const start = files[i].path.length - 8;
			const stop = start + 4;
			const year = files[i].path.substring(start, stop);
			const regexp = new RegExp('^[1-9][01-9]{3}$');
			const test = regexp.test(year);
			if (test)
			{
				this.addTabledataToDB(year, status);
			}
			else
			{
				status.failure("'" + year + "' sieht nicht wie ein Jahr aus");
			}
			newTablefiles = R.append(status, newTablefiles);
		}
		this.setState({ tablefiles: R.concat(newTablefiles, this.state.tablefiles) });
	}

	private getNameForId(id: string): string
	{
		console.log("getNameForId: " + id);
		if (!this.props.geodata)
		{
			return id;
		}
		console.log(this.props.geoId);
		const feature = this.props.geodata.getFeatureByFieldValue(this.props.geoId || "OT", id);
		if ( feature && feature.properties && this.props.geoName)
		{
			return feature.properties[this.props.geoName];
		}
		else
		{
			return id;
		}
	}

	private addTabledataToDB(year: string, filestatus: TableFileStatus)
	{
		Tabledata.read(filestatus.getPath(), (tabledata) => {
			const columnHeaders = R.slice(1, tabledata.getColumnCount(), tabledata.getRowAt(2));
			const rowHeaders = R.slice(3, tabledata.getRowCount(), tabledata.getColumnAt(0));
			const columnNames = R.map(this.getNameForId.bind(this), columnHeaders);
			const rowNames = R.map(this.getNameForId.bind(this), rowHeaders);
			const valueMatrix = tabledata.getTabledataBy([3, tabledata.getRowCount()], [1, tabledata.getColumnCount()]);
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
			filestatus.success("Datei erfolgreich geladen");
			this.props.addYear(year);
		});
	}

	private formatTableStatus(tablefile: TableFileStatus)
	{
		if (tablefile.getStatus() == "success")
		{
			return (<div key={tablefile.getPath()} className="p-col-12 status-success">✓ {tablefile.getPath()} erfolgreich geladen.</div>);
		}
		if (tablefile.getStatus() == "failure")
		{
			return (<div key={tablefile.getPath()} className="p-col-12 status-failure">✗ Laden von {tablefile.getPath()} gescheitert: {tablefile.getMessage()}.</div>);
		}
		return (<div key={tablefile.getPath()} className="p-col-12 status-progress">↺ {tablefile.getPath()} wird geladen…</div>);
	}

}