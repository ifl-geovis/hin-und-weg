import { Dropdown } from "primereact/dropdown";
import { Panel } from "primereact/panel";

import R from "ramda";
import React from "react";
import Log from "../log";

import FileInput from "./input/FileInput";

import Geodata from "../model/Geodata";
import Tabledata from "../model/Tabledata";
import TableFileStatus from "../data/TableFileStatus";
import MessageList from '../data/MessageList';

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
	change: () => void;
}

interface IImportState
{
	tablefiles: TableFileStatus[];
	shapeloadmessage: string;
	newtableloading: boolean;
}

export default class ImportView extends React.Component<IImportProps, IImportState>
{

	private static savedTableStatus: TableFileStatus[] = [];

	constructor(props: IImportProps)
	{
		super(props);
		this.onSelectGeodataFile = this.onSelectGeodataFile.bind(this);
		this.onSelectTabledataFiles = this.onSelectTabledataFiles.bind(this);
		this.generateSummaryMessage = this.generateSummaryMessage.bind(this);
		Log.debug('Importview new');
		this.state =
		{
			tablefiles: ImportView.savedTableStatus,
			shapeloadmessage: "",
			newtableloading: false,
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
				<p className="loadmessage">{this.state.shapeloadmessage}</p>
			</div>
		);
	}

	private onSelectGeodataFile(files: FileList)
	{
		Log.debug("ImportView.onSelectGeodataFile", files);
		if (files.length != 1) MessageList.getMessageList().addMessage('Es kann nur eine Shape-Datei geladen werden!', 'error');
		else if (!files[0].name.endsWith(".shp")) MessageList.getMessageList().addMessage('Die Datei ' + files[0].name + ' sieht nicht wie eine Shape-Datei aus.', 'error');
		else
		{
			this.setState({ shapeloadmessage: "Shape-Datei " + files[0].name + " wird geladen. Bitte warten."});
			Geodata.read(files[0].path, (newGeodata) => {
				Log.trace("ImportView.onSelectGeodataFile setGeodata", newGeodata);
				this.setState({ shapeloadmessage: ""});
				MessageList.getMessageList().addMessage('Shape Datei wurde erfolgreich geladen.', 'success');
				this.props.setGeodata(newGeodata.transformToWGS84());
			}, (reason) => {
				Log.debug("ImportView.onSelectGeodataFile failure", reason);
				this.setState({ shapeloadmessage: ""});
				MessageList.getMessageList().addMessage("Problem beim Einlesen der Shape-Datei aufgetreten. Fehlermeldung ist: " + reason, 'error');
				this.props.change();
			});
		}
		this.props.change();
	}

	private onSelectTabledataFiles(files: FileList)
	{
		this.setState({ newtableloading: true });
		let newTablefiles = [] as TableFileStatus[];
		for (let i=0;i<files.length; i++)
		{
			let status: TableFileStatus = new TableFileStatus(files[i].path);
			this.readTabledata(status);
			newTablefiles = R.append(status, newTablefiles);
		}
		this.setState({ tablefiles: R.concat(newTablefiles, this.state.tablefiles) });
		this.generateSummaryMessage();
	}

	private loadMetadata(tabledata: Tabledata, filestatus: TableFileStatus): any
	{
		Log.trace('Header 1:', R.slice(0, tabledata.getColumnCount(), tabledata.getRowAt(0)));
		Log.trace('Header 2:', R.slice(0, tabledata.getColumnCount(), tabledata.getRowAt(1)));
		let metadata = new Object();
		for (let i = 0; i < tabledata.getColumnCount(); i++)
		{
			const key = tabledata.getValueAt(0, i);
			const value = tabledata.getValueAt(1, i);
			//@ts-ignore
			if (key) metadata[key] = value;
		}
		return metadata;
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

	private loadHeaderNames(tabledata: Tabledata): [any[], any[]]
	{
		const columnHeaders = R.slice(1, tabledata.getColumnCount(), tabledata.getRowAt(2));
		const rowHeaders = R.slice(3, tabledata.getRowCount(), tabledata.getColumnAt(0));
		Log.debug('columnHeaders:', columnHeaders);
		Log.debug('rowHeaders:', rowHeaders);
		return [columnHeaders, rowHeaders];
	}

	private loadHeaderNamesForPopulation(tabledata: Tabledata, filestatus: TableFileStatus): [any[], any[]]
	{
		const [columnHeaders, rowHeaders] = this.loadHeaderNames(tabledata);
		const rowNames = R.map(this.getNameForId.bind(this), rowHeaders);
		const geocount = this.props.geodata!.count();
		if (rowNames.length != geocount) filestatus.failure("Zeilenzahl (" + rowNames.length + ") entspricht nicht den Geodaten (" + geocount + ")");
		for (let i in rowNames)
		{
			const rownum = parseInt(i, 10) + 4;
			if (rowNames[i] == null) filestatus.failure("Index '" + rowHeaders[i] + "' (Zeile " + rownum + ") nicht in den Geodaten gefunden");
		}
		return [columnHeaders, rowNames];
	}

	private loadHeaderNamesForMovement(tabledata: Tabledata, filestatus: TableFileStatus): [any[], any[]]
	{
		const [columnHeaders, rowHeaders] = this.loadHeaderNames(tabledata);
		if (columnHeaders.length != rowHeaders.length) filestatus.failure("Anzahl der Zeilen und Spalten stimmt nicht überein.");
		else for (let i in columnHeaders)
		{
			if (columnHeaders[i] != rowHeaders[i]) filestatus.failure("Spaltenindex " + columnHeaders[i] + " stimmt nicht mit Zeilenindex " + rowHeaders[i] + " überein.");
		}
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

	private readTabledata(filestatus: TableFileStatus)
	{
		Tabledata.read(filestatus.getPath(), (tabledata) => {
			const metadata = this.loadMetadata(tabledata, filestatus);
			Log.debug('metadata', metadata);
			Log.debug('data type:', metadata.type);
			if (metadata.type == 'population') this.addPopulationDataToDB(metadata, tabledata, filestatus);
			else if (metadata.type == 'movement-year') this.addMovementYearDataToDB(metadata.year.toString(), tabledata, filestatus);
			else filestatus.failure("Unbekannter Typ von Tabellendaten: " + metadata.type);
			this.generateSummaryMessage();
			this.setState({ tablefiles: this.state.tablefiles });
		});
	}

	private addPopulationDataToDB(metadata: any, tabledata: Tabledata, filestatus: TableFileStatus)
	{
		const [columnNames, rowNames] = this.loadHeaderNamesForPopulation(tabledata, filestatus);
		Log.debug("columnNames: ", columnNames);
		Log.debug("rowNames: ", rowNames);
		Log.trace("filestatus.getStatus(): ", filestatus.getStatus());
		if (filestatus.getStatus() == "running")
		{
			const valueMatrix = tabledata.getTabledataBy([3, tabledata.getRowCount()], [1, tabledata.getColumnCount()]);
			for (let row = 0; row < valueMatrix.getRowCount(); row++)
			{
				for (let column = 0; column < valueMatrix.getColumnCount(); column++)
				{
					const wert = parseInt(valueMatrix.getValueAt(row, column), 10);
					const area = rowNames[row];
					const jahr = columnNames[column];
					this.props.db(`INSERT INTO population ('${area}', '${jahr}', ${isNaN(wert) ? "NULL" : wert});`);
				}
			}
			filestatus.success("Datei erfolgreich geladen");
		}
		this.generateSummaryMessage();
		this.setState({ tablefiles: this.state.tablefiles });
	}

	private addMovementYearDataToDB(year: string, tabledata: Tabledata, filestatus: TableFileStatus)
	{
		const regexp = new RegExp('^[1-9][01-9]{3}$');
		const test = regexp.test(year);
		if (!test) filestatus.failure("'" + year + "' sieht nicht wie ein Jahr aus");
		const [columnNames, rowNames] = this.loadHeaderNamesForMovement(tabledata, filestatus);
		Log.debug("columnNames: ", columnNames);
		Log.debug("rowNames: ", rowNames);
		Log.trace("filestatus.getStatus(): ", filestatus.getStatus());
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
		this.generateSummaryMessage();
		this.setState({ tablefiles: this.state.tablefiles });
	}

	private generateSummaryMessage() {
		if (this.state.newtableloading == false) return;
		let successcount = 0;
		let errorcount = 0;
		for (let status of this.state.tablefiles) {
			if (status.getStatus() === 'running') return;
			else if (status.getStatus() === 'success') successcount++;
			else errorcount++;
		}
		if ((successcount == 0) && (errorcount == 0)) return;
		ImportView.savedTableStatus = [];
		for (let status of this.state.tablefiles) {
			if (status.getStatus() === 'success') ImportView.savedTableStatus.push(status);
		}
		let summarystatus = 'notice';
		if ((errorcount > 0) && (successcount > 0)) summarystatus = 'warning';
		if ((errorcount > 0) && (successcount == 0)) summarystatus = 'error';
		if ((errorcount == 0) && (successcount > 0)) summarystatus = 'success';
		let summary = 'Laden der Tabellendateien abgeschlossen. ';
		if (successcount > 0) summary += 'Es wurden ' + successcount + ' Tabellendateien erfolgreich geladen. ';
		if (errorcount > 0) summary += errorcount + ' Tabellendateien hatten Fehler beim Einladen.';
		MessageList.getMessageList().addMessage(summary, summarystatus);
		this.setState({ newtableloading: false });
		this.props.change();
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