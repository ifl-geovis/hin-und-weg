import { GeoJsonProperties } from "geojson";
import R from "ramda";
import React from "react";
import Geodata from "../../model/Geodata";
import SelectInput from "../input/SelectInput";
import MapView from "./MapView";

export interface IGeodataProps {
    items?: Array<{[name: string]: any}> | null;
    geodata: Geodata | null;
    selectedLocation?: string | null;
    onSelectLocation: (newLocation: string) => void;
}

export default class GeodataView extends React.Component<IGeodataProps> {

    constructor(props: IGeodataProps) {
        super(props);
    }

    public render(): JSX.Element {
        let attributes: GeoJsonProperties[] = [];
        let locations: string[] = [];
        if (this.props.geodata != null) {
            attributes = this.props.geodata.attributes();
            locations = R.sort((a: string, b: string) => a.localeCompare(b), R.map((item) => item!.Name, attributes));
        }
        return (
            <div className="p-grid">
                <div className="p-col-12">
                    <MapView geodata={this.props.geodata} nameField="Name" items={this.props.items}
                             selectedLocation={this.props.selectedLocation}
                             onSelectLocation={this.props.onSelectLocation}/>
                </div>
                <div className="p-col-4">Fläche auswählen:</div>
                <div className="p-col-8">
                    <SelectInput options={locations} selected={this.props.selectedLocation} onSelected={this.props.onSelectLocation}/>
                </div>
            </div>
       );
    }
}
