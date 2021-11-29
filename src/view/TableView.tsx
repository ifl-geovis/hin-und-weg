import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import R from "ramda";
import React from "react";
import { systemPreferences } from "electron";
import Log from '../log';
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../i18n/i18nClient';
import { TFunction } from "i18next";

export type TableItem  = {[name: string]: any} | null;

export interface ITableViewProps extends WithNamespaces {
	items: TableItem[];
	maxRows?: number | null;
}

// export default 
class TableView extends React.Component<ITableViewProps> {

	constructor(props: ITableViewProps) {
		super(props);
		this.sortByNumberValue = this.sortByNumberValue.bind(this);
		this.createColumn = this.createColumn.bind(this);
	}

	public render(): JSX.Element {
		const {t}:any = this.props ;
		if (R.isEmpty(this.props.items)) {
			return <div>{t('table.noData')}</div>;
			// return <div>Keine Daten vorhanden.</div>;
		}
		const fieldNames = R.keys(this.props.items[0]);
		var name;
		var id = 0
		for(name of fieldNames){
		if(name.valueOf() == "Absolutwert"){
				fieldNames.splice(id,1);
			}
			id +=1;
		}

		const columns = R.map(this.createColumn, fieldNames);
		return (
			<DataTable value={this.props.items} paginator={true} rows={this.props.maxRows || 10}
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks CurrentPageReport NextPageLink LastPageLink"
				currentPageReportTemplate={t('table.pageReport')}
				// currentPageReportTemplate="({currentPage} von {totalPages})"
				emptyMessage={t('table.noData')}>
				{/* emptyMessage="Keine Daten vorhanden."> */}
				{columns}
			</DataTable>
		);
	}

	private sortByNumberValue(event: any): any[] {
		Log.debug("sortByNumberValue event", event);
		let data = this.props.items;
		Log.debug("sortByNumberValue data", data);
		data.sort((data1: any, data2: any) => {
			Log.debug("sortByNumberValue data1", data1);
			Log.debug("sortByNumberValue data2", data2);
			let result = data1.Wert - data2.Wert;
			if (Number.isNaN(data1.Wert) && !Number.isNaN(data2.Wert)) result = -1;
			if (!Number.isNaN(data1.Wert) && Number.isNaN(data2.Wert)) result = 1;
			if (Number.isNaN(data1.Wert) && Number.isNaN(data2.Wert)) result = 0;
			Log.debug("sortByNumberValue result", result);
			return (event.order * result);
		});
		Log.debug("sortByNumberValue data", data);
		return data;
	}

	private createColumn(fieldName: string): JSX.Element {
		const {t}:any = this.props ;
		let fieldNameTranslated = fieldName === "Von" ? t('topics.from') : fieldName === "Nach" ?  t('topics.to') : fieldName === "Wert" ? t('table.value') : fieldName === "Jahr" ? t('table.year') : fieldName === "RateVon" ? t('table.rateVon') : fieldName === "RateNach" ? t('table.rateNach') : fieldName;
		const numberValue = (fieldName === "Wert") || (fieldName === "RateVon") || (fieldName === "RateNach");
		let filterMatchMode = "contains";
		if (numberValue) {
			filterMatchMode = "equals";
		}
		return <Column key={fieldName}  field={`${fieldName}`} header={fieldNameTranslated} filterPlaceholder={t('table.filter') }
		// return <Column key={fieldName}  field={`${fieldName}`} header={fieldNameTranslated} filterPlaceholder="Filtern ..."
							// @ts-ignore
							sortable={true} sortFunction={numberValue ? this.sortByNumberValue : null} filter={true} filterMatchMode={filterMatchMode}/>;
	}

}
export default withNamespaces()(TableView);
