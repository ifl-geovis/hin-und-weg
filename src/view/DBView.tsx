import React from "react";

import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";

import TableView from "./TableView";

export interface IDBViewProps {
    db: alaSQLSpace.AlaSQL;
}

interface IDBViewState {
    query: string;
}

export default class DBView extends React.Component<IDBViewProps, IDBViewState> {

    constructor(props: IDBViewProps) {
        super(props);
        this.state = {
            query: "SELECT * FROM matrices;",
        };
    }

    public render(): JSX.Element {
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
                <div className="p-col-12"> Tabelle <b>matrices</b>:</div>
                <div className="p-col-12"><TableView items={results} maxRows={20}/></div>
                <div className="p-col-12"> SQL-Abfrage:</div>
                <div className="p-col-12">
                    <InputTextarea className="p-col-12" rows={5}
                                onChange={(e: React.FormEvent<HTMLTextAreaElement>) => {
                                    editorContent = (e.target as HTMLTextAreaElement).value;
                                }}
                                placeholder={editorContent}
                                autoResize={true}/>
                </div>
                <div className="p-col-2">
                    <Button label="Ausführen" onClick={(e) => this.setState({query: editorContent})} />
                </div>
                <div className="p-col-12" style={{color: "red"}}>{errors}</div>
            </div>);
        }
}
