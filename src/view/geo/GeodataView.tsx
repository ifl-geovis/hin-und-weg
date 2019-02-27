import { GeoJsonProperties } from "geojson";
import React from "react";
import Geodata from "../../model/Geodata";
import FileInput from "../input/FileInput";
import AttributeView from "./AttributeView";
import MapView from "./MapView";


export interface IGeodataProps {
    geodata: Geodata | null;
    onSelectGeodata: (file: File) => void;
}

export default class GeodataView extends React.Component<IGeodataProps> {

    constructor(props: IGeodataProps){
        super(props);
        this.shpFilesSelected = this.shpFilesSelected.bind(this);
    }

    // HINT: In the moment we support only one geodata file for selection
    public shpFilesSelected(fileList: FileList) {
        this.props.onSelectGeodata(fileList[0]);
    }

    public render(): JSX.Element{
        let attributes: GeoJsonProperties[] = [];
        if (this.props.geodata != null) {
            attributes = this.props.geodata.attributes();
        }
        return (
        <div key="geodataView">
            <div  key="shapeFileInput">
                <FileInput label="Shape Datei auswählen..." filesSelected={this.shpFilesSelected} disabled={false}/>
            </div>
            <div key="mapView">
                <MapView  geodata={this.props.geodata}/>
            </div>
            <div key="attributeView">
                <AttributeView  attributes={attributes}/>
            </div>
        </div>
       );
    }
}
