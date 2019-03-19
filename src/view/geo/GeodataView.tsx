import { GeoJsonProperties } from "geojson";
import React from "react";
import Geodata from "../../model/Geodata";
// import TableView from "../TableView";
import MapView from "./MapView";

export interface IGeodataProps {
    items?: {[name: string]: any} | null;
    geodata: Geodata | null;
    selectedLocation?: string | null;
    onSelectLocation: (newLocation: string) => void;
}

export default class GeodataView extends React.Component<IGeodataProps> {

    constructor(props: IGeodataProps) {
        super(props);
    }

    public render(): JSX.Element {
        /*
        let attributes: GeoJsonProperties[] = [];
        if (this.props.geodata != null) {
            attributes = this.props.geodata.attributes();
        }
        */
        return (
            <div className="p-grid">
                <div className="p-col-12">
                    <MapView geodata={this.props.geodata} nameField="Name" selectedLocation={this.props.selectedLocation}
                             onSelectLocation={this.props.onSelectLocation}/>
                </div>
                <div className="p-col-12">
                    Ausgewählt: <b>{this.props.selectedLocation}</b>
                </div>
            </div>
       );
    }
}
