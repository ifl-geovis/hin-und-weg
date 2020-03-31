import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import R from "ramda";
import React from "react";
import { systemPreferences } from "electron";

export type TableItem  = {[name: string]: any} | null;

export interface ITableViewProps {
    items: TableItem[];
    maxRows?: number | null;
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
        var name;
        var id = 0
        for(name of fieldNames){
            console.log(id + " " + name + " vor Abfrage");
            if(name.valueOf() == "Absolutwert"){
                fieldNames.splice(id,1);
                console.log(id + " " + name +  " in Abfrage");
            }
            id +=1;
            
            console.log(id + " " + name +  " nach Abfrage");
        } 


        const columns = R.map(this.createColumn, fieldNames);
        return (
            <DataTable value={this.props.items} paginator={true} rows={this.props.maxRows || 10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="({currentPage} von {totalPages})"
                emptyMessage="Keine Daten vorhanden.">
                {columns}
            </DataTable>
        );
    }

    private createColumn(fieldName: string): JSX.Element {
        let filterMatchMode = "contains";
        if (fieldName === "Wert"){
            filterMatchMode = "equals";
        }
        return <Column key={fieldName}  field={`${fieldName}`} header={fieldName} filterPlaceholder="Filtern ..."
                        sortable={true} filter={true} filterMatchMode={filterMatchMode}/>;
    }
}
