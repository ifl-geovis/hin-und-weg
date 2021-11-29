import React from "react";

import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";

import TableView from "./TableView";
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../i18n/i18nClient';
import { TFunction } from "i18next";

export interface IDBViewProps extends WithNamespaces{
	db: alaSQLSpace.AlaSQL;
}

interface IDBViewState {
	query: string;
}

// export default 
class DBView extends React.Component<IDBViewProps, IDBViewState> {

	constructor(props: IDBViewProps) {
		super(props);
		this.state = {
			query: "SELECT * FROM matrices;",
		};
	}

	public render(): JSX.Element {
		const {t}:any = this.props ;
		let editorContent = this.state.query;
		let results = [];
		let errors = "";
		try {
			results = this.props.db(this.state.query);
		} catch (error) {
			console.error(error);
			errors = `Error: ${error.message}`;
			results = [];
		}
		return (
			<div className="p-grid p-justify-around">
				<div className="p-col-12">{t('table.queryResult')}</div>
				{/* <div className="p-col-12"> Ergebnis der Abfrage:</div> */}
				<div className="p-col-12"><TableView items={results} maxRows={20}/></div>
				<div className="p-col-12">{t('table.query')}</div>
				{/* <div className="p-col-12"> SQL-Abfrage:</div> */}
				<div className="p-col-12">
					<InputTextarea className="p-col-12" rows={5}
								onChange={(e: React.FormEvent<HTMLTextAreaElement>) => {
									editorContent = (e.target as HTMLTextAreaElement).value;
									editorContent = editorContent.replace("Year", "Jahr");
									editorContent = editorContent.replace("Value", "Wert");
									editorContent = editorContent.replace("From", "Von");
									editorContent = editorContent.replace("To", "Nach");
									editorContent = editorContent.replace("Rate From", "RateVon");
									editorContent = editorContent.replace("Rate To", "RateNach");
								}}
								placeholder={editorContent}
								autoResize={true}/>
				</div>
				<div className="p-col-2">
					<Button label={t('table.execute')} onClick={(e) => this.setState({query: editorContent})} />
					{/* <Button label="Ausführen" onClick={(e) => this.setState({query: editorContent})} /> */}
				</div>
				<div className="p-col-12" style={{color: "red"}}>{errors}</div>
				<div className="p-col-12">{t('table.NaN')}</div>
				{/* <div className="p-col-12">NaN steht für Not a Number (keine Zahl). Dies betrifft anonymisierte Daten und die Ergebnisse von Berechnungen, die kein Ergebnis haben (wie Division durch Null).</div> */}
			</div>);
		}
}
export default withNamespaces()(DBView);
