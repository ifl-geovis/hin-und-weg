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
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../i18n/i18nClient';
import { TFunction } from "i18next";

export interface IImportProps extends WithNamespaces
{
	db: alaSQLSpace.AlaSQL;
	geodata: Geodata | null;
	geoId: string | null;
	geoName: string | null;
	shapefilename: string;
	setGeodata: (geodata: Geodata) => void;
	setGeoName: (geoName: string) => void;
	setGeoId: (geoId: string) => void;
	setShapefileName: (shapefilename: string) => void;
	setPopulationDataLoaded: () => void;
	addYear: (year: string) => void;
	change: () => void;
}

interface IImportState
{
	tablefiles: TableFileStatus[];
	shapeloadmessage: string;
	newtableloading: boolean;
}

// export default
class ImportView extends React.Component<IImportProps, IImportState>
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
		const {t}:any = this.props ;

		return (
			<div>
				<Panel header={t('importView.geodata')} >
					<div className="p-grid p-justify-around">
						{shapefilebutton}
						<div className="p-col-3">{t('importView.idSelect')}</div>
						<Dropdown className="p-col-3" key="geoId" value={this.props.geoId} options={geoFieldOptions} disabled={this.props.geodata == null} placeholder={t('importView.idColumn')} onChange={(e) => {this.props.setGeoId(e.value); } }/>
						<div className="p-col-3">{t('importView.nameAttrSelect')}</div>
						<Dropdown className="p-col-3" key="geoName" value={this.props.geoName} options={geoFieldOptions} disabled={this.props.geodata == null} placeholder={t('importView.nameColumn')} onChange={(e) => {this.props.setGeoName(e.value); } }/>
					</div>
				</Panel>
				<Panel header={t('importView.tableData')}  style={((this.props.geodata == null) || (this.props.geoId == null) || (this.props.geoName == null) || (this.props.geodata.fields().indexOf(this.props.geoId) < 0)) ? {display: "none"} : {display: "block"}}>
					<div className="p-grid">
						<div className="p-col-12">
							<FileInput label={t('importView.addTableData')} filesSelected={this.onSelectTabledataFiles} disabled={false} accept=".csv"/>
						</div>
						{tablesfiles}
					</div>
				</Panel>
			</div>
		);
	}

	private getShapeFileButton() {
		const {t}:any = this.props ;
		if (this.props.geodata) return (
			<div className="p-col-12 status-success">{t('importView.shp')} {this.props.shapefilename} {t('importView.shpLoaded')}</div>
		);
		return (
			<div className="p-col-12">
				<FileInput label={t('importView.ShpButton')} filesSelected={this.onSelectGeodataFile} disabled={false} accept=".shp"/>
				<div className="status-progress">{this.state.shapeloadmessage}</div>
			</div>
		);
	}

	private onSelectGeodataFile(files: FileList)
	{
		const {t}:any = this.props ;
		Log.debug("ImportView.onSelectGeodataFile", files);
		if (files.length != 1) MessageList.getMessageList().addMessage(t('importView.shpError') , 'error');
		else if (!files[0].name.endsWith(".shp")) MessageList.getMessageList().addMessage(t('importView.file') + files[0].name + t('importView.notShp'), 'error');
		else
		{
			this.setState({ shapeloadmessage: t('importView.shp2') + files[0].name + t('importView.shpLoading') });
			this.props.setShapefileName(files[0].name);
			Geodata.read(files[0].path, (newGeodata) => {
				Log.trace("ImportView.onSelectGeodataFile setGeodata", newGeodata);
				this.setState({ shapeloadmessage: ""});
				MessageList.getMessageList().addMessage(t('importView.shp3') + this.props.shapefilename + t('importView.shpLoaded2'), 'success');
				this.props.setGeodata(newGeodata.transformToWGS84());
			}, (reason) => {
				Log.debug("ImportView.onSelectGeodataFile failure", reason);
				this.setState({ shapeloadmessage: ""});
				MessageList.getMessageList().addMessage(t('importView.shpProblem1') + this.props.shapefilename + t('importView.shpProblem2') + reason, 'error');
				this.props.change();
			});
		}
		this.props.change();
	}

	private isAlreadyLoaded(path: string)
	{
		for (let tablefile of this.state.tablefiles) {
			if (tablefile.getPath() === path) return true;
		}
		return false;
	}

	private onSelectTabledataFiles(files: FileList)
	{
		const {t}:any = this.props ;
		this.setState({ newtableloading: true });
		let newTablefiles = [] as TableFileStatus[];
		for (let i=0;i<files.length; i++)
		{
			if (this.isAlreadyLoaded(files[i].path)) {
				MessageList.getMessageList().addMessage(t('importView.csv') + files[i].path + t('importView.csvRepetition') , 'error');
				this.props.change();
			} else {
				let status: TableFileStatus = new TableFileStatus(files[i].path);
				this.readTabledata(status);
				newTablefiles = R.append(status, newTablefiles);
			}
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
		const {t}:any = this.props ;
		const [columnHeaders, rowHeaders] = this.loadHeaderNames(tabledata);
		const rowNames = R.map(this.getNameForId.bind(this), rowHeaders);
		const geocount = this.props.geodata!.count();
		if (rowNames.length != geocount) filestatus.failure(t('importView.rowsNumber1') + rowNames.length + t('importView.rowsNumber2')  + geocount + ")");
		for (let i in rowNames)
		{
			const rownum = parseInt(i, 10) + 4;
			if (rowNames[i] == null) filestatus.failure(t('importView.indexCheck1') + rowHeaders[i] + t('importView.indexCheck2') + rownum + t('importView.indexCheck3'));
		}
		return [columnHeaders, rowNames];
	}

	private loadHeaderNamesForMovement(tabledata: Tabledata, filestatus: TableFileStatus): [any[], any[]]
	{
		const {t}:any = this.props ;
		const [columnHeaders, rowHeaders] = this.loadHeaderNames(tabledata);
		if (columnHeaders.length != rowHeaders.length) filestatus.failure(t('importView.numberRowsColumns'));
		else for (let i in columnHeaders)
		{
			if (columnHeaders[i] != rowHeaders[i]) filestatus.failure(t('importView.indexRowsColumns1') + columnHeaders[i] + t('importView.indexRowsColumns2') + rowHeaders[i] + t('importView.indexRowsColumns3'));
		}
		const columnNames = R.map(this.getNameForId.bind(this), columnHeaders);
		const rowNames = R.map(this.getNameForId.bind(this), rowHeaders);
		const geocount = this.props.geodata!.count();
		if (columnNames.length != geocount) filestatus.failure(t('importView.columnsGeodata1') + columnNames.length + t('importView.columnsGeodata2')  + geocount + ")");
		if (rowNames.length != geocount) filestatus.failure(t('importView.rowsGeodata1') + rowNames.length + t('importView.rowsGeodata2')  + geocount + ")");
		for (let i in columnNames)
		{
			const colnum = parseInt(i, 10) + 2;
			if (columnNames[i] == null) filestatus.failure(t('importView.indexCheck1')+ columnHeaders[i] + t('importView.indexCheck4') + colnum + t('importView.indexCheck3'));
		}
		for (let j in rowNames)
		{
			const rownum = parseInt(j, 10) + 4;
			if (rowNames[j] == null) filestatus.failure(t('importView.indexCheck1') + rowHeaders[j] + t('importView.indexCheck2') + rownum + t('importView.indexCheck3'));
		}
		return [columnNames, rowNames];
	}

	private readTabledata(filestatus: TableFileStatus)
	{
		const {t}:any = this.props ;
		Tabledata.read(filestatus.getPath(), (tabledata) => {
			const metadata = this.loadMetadata(tabledata, filestatus);
			const metadata_error = this.validateMetadata(metadata)
			Log.debug('metadata', metadata);
			Log.debug('data type:', metadata.type);
			Log.debug('metadata error', metadata_error);
			if (metadata_error) filestatus.failure(metadata_error);
			else
			{
				if (metadata.type === 'population') this.addPopulationDataToDB(metadata, tabledata, filestatus);
				else if (metadata.type === 'movement') {
					if (metadata.timeunit === 'year') this.addMovementYearDataToDB(metadata.time.toString(), tabledata, filestatus);
					else filestatus.failure(t('importView.unknownTimeUnit') + metadata.timeunit);
				} else filestatus.failure(t('importView.unknownTableData')  + metadata.type);
			}
			this.generateSummaryMessage();
			this.setState({ tablefiles: this.state.tablefiles });
		});
	}

	private validateMetadata(metadata: any)
	{
		const {t}:any = this.props ;
		if (!metadata) return t('importView.metadaten.missing');
		if (!metadata.type) return t('importView.metadaten.noType');
		if ((metadata.type != 'population') && (metadata.type != 'movement')) return t('importView.metadaten.unknownType') + metadata.type + t('importView.metadaten.unknownType2');
		if (metadata.type === 'population')
		{
			if (!metadata.begin) return t('importView.metadaten.noBegin');
			if (!metadata.end) return t('importView.metadaten.noEnd');
		}
		if (metadata.type === 'movement')
		{
			if (!metadata.timeunit) return t('importView.metadaten.noTimeUnit');
			if (!metadata.time) return t('importView.metadaten.noTime');
			if (metadata.timeunit != 'year') return t('importView.metadaten.unknownTimeUnit') + metadata.type + t('importView.metadaten.unknownTimeUnit2');
		}
		return null;
	}

	private addPopulationDataToDB(metadata: any, tabledata: Tabledata, filestatus: TableFileStatus)
	{
		const {t}:any = this.props ;
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
			this.props.setPopulationDataLoaded();
			filestatus.success(t('importView.fileLoaded'));
		}
		this.generateSummaryMessage();
		this.setState({ tablefiles: this.state.tablefiles });
	}

	private addMovementYearDataToDB(year: string, tabledata: Tabledata, filestatus: TableFileStatus)
	{
		const {t}:any = this.props ;
		const regexp = new RegExp('^[1-9][01-9]{3}$');
		const test = regexp.test(year);
		if (!test) filestatus.failure("'" + year + t('importView.notYear'));
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
					this.props.db(`INSERT INTO matrices ('${nach}','${von}','${jahr}', ${isNaN(wert) ? null : wert}, null, null);`);
				}
			}
			filestatus.success(t('importView.fileLoaded'));
			this.props.addYear(year);
		}
		this.generateSummaryMessage();
		this.setState({ tablefiles: this.state.tablefiles });
	}

	private generateSummaryMessage() {
		const {t}:any = this.props ;
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
		let summary = t('importView.tabledata1');
		if (successcount > 0) summary += t('importView.tabledata2') + successcount + t('importView.tabledata3');
		if (errorcount > 0) summary += errorcount + t('importView.tabledata4');
		this.recalculateWanderungsrate();
		MessageList.getMessageList().addMessage(summary, summarystatus);
		this.setState({ newtableloading: false });
		this.props.change();
	}

	private recalculateWanderungsrate() {
		Log.debug("recalculateWanderungsrate");
		const results: any[] = this.props.db(`SELECT Area, Jahr, Wert FROM population;`);
		Log.debug("results", results);
		for (const popdata of results)
		{
			this.props.db(`UPDATE matrices SET RateVon = ROUND(Wert * 1000 / ${popdata.Wert}, 3) WHERE Von = '${popdata.Area}' AND Jahr = '${popdata.Jahr}'`);
			this.props.db(`UPDATE matrices SET RateNach = ROUND(Wert * 1000 / ${popdata.Wert}, 3) WHERE Nach = '${popdata.Area}' AND Jahr = '${popdata.Jahr}'`);
		}
	}

	private formatTableStatus(tablefile: TableFileStatus)
	{
		const {t}:any = this.props ;
		if (tablefile.getStatus() == "success")
		{
			return (<div key={tablefile.getPath()} className="p-col-12 status-success">✓ {tablefile.getPath()} {t('importView.success')}</div>);
		}
		if (tablefile.getStatus() == "failure")
		{
			return (<div key={tablefile.getPath()} className="p-col-12 status-failure">✗ {t('importView.loading')} {tablefile.getPath()} {t('importView.failed')} {tablefile.getMessage()}.</div>);
		}
		return (<div key={tablefile.getPath()} className="p-col-12 status-progress">↺ {tablefile.getPath()} {t('importView.loading2')}…</div>);
	}

}
export default withNamespaces()(ImportView);
