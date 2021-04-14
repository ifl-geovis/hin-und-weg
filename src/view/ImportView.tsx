import { Dropdown } from "primereact/dropdown";
import { Panel } from "primereact/panel";

import R from "ramda";
import React from "react";
import Log from "../log";

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
	shapeloadmessage: string;
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
			tablefiles: [],
			shapeloadmessage: "",
		};
	}

	public render(): JSX.Element
	{
		let geoFieldOptions;
		if (this.props.geodata)
		{
			geoFieldOptions = R.map((field) => { return { label: field, value: field }; }, this.props.geodata.fields());
		}
		const tablesfiles = R.map((tablefile) => { return this.formatTableStatus(tablefile); }, this.state.tablefiles);
		const shapefilebutton = this.getShapeFileButton();
		return (
			<div>
				<Panel header="1. Geodaten">
					<div className="p-grid p-justify-around">
						{shapefilebutton}
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

	private getShapeFileButton() {
		if (this.props.geodata) return (
			<div className="p-col-12">
				<p className="successmessage">Shape Datei wurde erfolgreich geladen...</p>
			</div>
		);
		return (
			<div className="p-col-12">
				<FileInput label="Shape Datei auswählen..." filesSelected={this.onSelectGeodataFile} disabled={false}/>
				<p className="errormessage">{this.state.shapeloadmessage}</p>
			</div>
		);
	}

	private onSelectGeodataFile(files: FileList)
	{
		Log.debug("ImportView.onSelectGeodataFile(" + files + ")");
		this.setState({ shapeloadmessage: "" });
		if (files.length != 1) this.setState({ shapeloadmessage: "Es kann nur eine Shape-Datei geladen werden!" });
		else if (!files[0].name.endsWith(".shp")) this.setState({ shapeloadmessage: "Die Datei " + files[0].name + " sieht nicht wie eine Shape-Datei aus." });
		else
		{
			this.setState({ shapeloadmessage: "Problem beim Einlesen der Datei " + files[0].name + " aufgetreten." });
			Geodata.read(files[0].path, (newGeodata) => {
				Log.trace("ImportView.onSelectGeodataFile setGeodata(" + newGeodata + ")");
				this.props.setGeodata(newGeodata.transformToWGS84());
			});
		}
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

	private getNameForId(id: string): string|null
	{
		Log.trace("ImportView.getNameForId(" + id + ")");
		if (!this.props.geodata)
		{
			return null;
		}
		let feature = this.props.geodata.getFeatureByFieldValue(this.props.geoId || "OT", id);
		if (feature == null) feature = this.props.geodata.getFeatureByFieldValue(this.props.geoId || "OT", "0" + id);
		if (feature == null) feature = this.props.geodata.getFeatureByFieldValue(this.props.geoId || "OT", "00" + id);
		if (feature == null) feature = this.props.geodata.getFeatureByFieldValue(this.props.geoId || "OT", "000" + id);
		if (id && feature && feature.properties && this.props.geoName)
		{
			return feature.properties[this.props.geoName];
		}
		else
		{
			return null;
		}
	}

	private loadHeaderNames(tabledata: Tabledata, filestatus: TableFileStatus): [any[], any[]]
	{
		const columnHeaders = R.slice(1, tabledata.getColumnCount(), tabledata.getRowAt(2));
		const rowHeaders = R.slice(3, tabledata.getRowCount(), tabledata.getColumnAt(0));
		const columnNames = R.map(this.getNameForId.bind(this), columnHeaders);
		const rowNames = R.map(this.getNameForId.bind(this), rowHeaders);
		const geocount = this.props.geodata!.count();
		if (columnNames.length != geocount) filestatus.failure("Spaltenzahl (" + columnNames.length + ") entspricht nicht den Geodaten (" + geocount + ")");
		if (rowNames.length != geocount) filestatus.failure("Zeilenzahl (" + rowNames.length + ") entspricht nicht den Geodaten (" + geocount + ")");
		for (let i in columnNames)
		{
			const colnum = parseInt(i, 10) + 2;
			if (columnNames[i] == null) filestatus.failure("Index '" + columnHeaders[i] + "' (Spalte " + colnum + ") nicht in den Geodaten gefunden");
		}
		for (let j in rowNames)
		{
			const rownum = parseInt(j, 10) + 4;
			if (rowNames[j] == null) filestatus.failure("Index '" + rowHeaders[j] + "' (Zeile " + rownum + ") nicht in den Geodaten gefunden");
		}
		return [columnNames, rowNames];
	}

	private addTabledataToDB(year: string, filestatus: TableFileStatus)
	{
		Tabledata.read(filestatus.getPath(), (tabledata) => {
			const [columnNames, rowNames] = this.loadHeaderNames(tabledata, filestatus);
			Log.debug("columnNames: ", columnNames);
			Log.debug("rowNames: ", rowNames);
			Log.debug("filestatus.getStatus(): ", filestatus.getStatus());
			if (filestatus.getStatus() == "running")
			{
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
			}
			this.setState({ tablefiles: this.state.tablefiles });
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