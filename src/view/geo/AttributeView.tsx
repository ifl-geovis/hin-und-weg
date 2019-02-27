import { Cell, Column, Table } from "@blueprintjs/table";
import { GeoJsonProperties } from "geojson";
import R from "ramda";
import React from "react";

export interface IAttributeViewProps {
    attributes: GeoJsonProperties[];
}

interface IAttributeViewState {
    width: number;
    height: number;
}

export default class AttributeView extends React.Component<IAttributeViewProps, IAttributeViewState> {

    constructor(props: IAttributeViewProps) {
        super(props);
        this.state = {
            height: 200,
            width: 350,
        };
    }

    public render(): JSX.Element {
        if (R.isEmpty(this.props.attributes)){
            return <div>Keine Attribute vorhanden.</div>;
        }
        const createColumn = ((name: string) => {
            return <Column key={name} name={name} cellRenderer={(i: number) => <Cell>{this.props.attributes[i]![name]}</Cell>}></Column> }
        );
        const firstAttributes: GeoJsonProperties = R.head(this.props.attributes)!;
        const columns = R.map(createColumn, R.keys(firstAttributes) as string[]);

        return (
            <div style={{width: `${this.state.width}px`, height: `${this.state.height}px`, overflow: "auto"}}>
                <Table numRows={this.props.attributes.length}>
                    {columns}
                </Table>
            </div>
       );
    }
}
