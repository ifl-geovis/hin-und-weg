import { GeoJsonProperties } from "geojson";
import React from "react";
import Geodata from "../../model/Geodata";
import TableView from "../TableView";
import MapView from "./MapView";

export interface IGeodataProps {
    geodata: Geodata | null;
}

export default class GeodataView extends React.Component<IGeodataProps> {

    constructor(props: IGeodataProps) {
        super(props);
    }

    public render(): JSX.Element {
        let attributes: GeoJsonProperties[] = [];
        if (this.props.geodata != null) {
            attributes = this.props.geodata.attributes();
        }
        return (
        <div>
            <MapView  geodata={this.props.geodata}/>
            <TableView items={attributes}/>
        </div>
       );
    }
}
