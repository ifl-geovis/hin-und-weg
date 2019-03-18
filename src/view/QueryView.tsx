import React from "react";

import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";

import TableView from "./TableView";

export interface IQueryViewProps {
    db: alaSQLSpace.AlaSQL;
}

interface IQueryViewState {
    query: string;
}

export default class QueryView extends React.Component<IQueryViewProps, IQueryViewState> {

    constructor(props: IQueryViewProps) {
        super(props);
        this.state = {
            query: "SELECT * FROM matrices;",
        };
    }

    public render(): JSX.Element {
        let editorContent = "";
        let results = [];
        let errors = "";
        try {
            results = this.props.db(this.state.query);
        } catch (error) {
            console.error(error);
            errors = "Error";
            results = [];
        }
        return (
            <div>
                <TableView items={results} maxRows={20}/>
                <div className="p-grid">
                    <InputTextarea className="p-col-10" rows={5} cols={60}
                                onChange={(e: React.FormEvent<HTMLTextAreaElement>) => {
                                    editorContent = (e.target as HTMLTextAreaElement).value;
                                }}
                                autoResize={true}/>
                    <Button className="p-col-2" label="Ausführen" onClick={(e) => this.setState({query: editorContent})} />
                    <div className="p-col-12">{errors}</div>
                </div>
            </div>
        );
    }

}
