import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import R from "ramda";
import React from "react";

export type TableItem  = {[name: string]: any} | null;

export interface ITableViewProps {
    items: TableItem[];
}

export default class TableView extends React.Component<ITableViewProps> {

    constructor(props: ITableViewProps) {
        super(props);
    }

    public render(): JSX.Element {
        if (R.isEmpty(this.props.items)) {
            return <div>Keine Daten vorhanden.</div>;
        }
        const fieldNames = R.keys(this.props.items[0]);
        const columns = R.map((fieldName) => <Column key={fieldName} field={`${fieldName}`} header={fieldName}></Column>, fieldNames);
        return (
            <DataTable value={this.props.items} paginator={true} rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks CurrentPageReport NextPageLink LastPageLink">
                {columns}
            </DataTable>
        );
    }
}
