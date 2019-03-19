import * as d3 from "d3";
import { Feature } from "geojson";
import R from "ramda";
import React from "react";
import Geodata from "../../model/Geodata";

export interface IMapViewProps {
    geodata: Geodata | null;
    nameField?: string | null;
    selectedLocation?: string | null;
    onSelectLocation: (newLocation: string) => void;
}

interface IMapViewState {
    width: number;
    height: number;
}

export default class MapView extends React.Component<IMapViewProps, IMapViewState> {

    constructor(props: IMapViewProps) {
        super(props);
        this.state = {
            height: 700,
            width: 600,
        };
    }

    public render(): JSX.Element {
        return (
            <svg width={this.state.width} height={this.state.height}>
                 {this.createD3Map()}
            </svg>
        );
    }

    private createD3Map(): object[] {
        const geodata = this.props.geodata;
        if (geodata == null) {
            return [
                <g key="no-geodata">
                    <text transform={"translate(" + this.state.width / 2 + "," + this.state.height / 2 + ")"}
                          style={{ fill: "#000000", stroke: "#aaaaaa"}}>Keine Geodaten geladen</text>
                </g>,
            ];
        }
        const projection = d3.geoMercator().fitSize([this.state.width, this.state.height],geodata.getFeatureCollection());
        const path = d3.geoPath().projection(projection);
        const indexedMap = R.addIndex(R.map);
        const features = indexedMap( (feature, id: number): JSX.Element => {
            const f = feature as Feature;
            const center = d3.geoCentroid(f);
            let title = "";
            if (this.props.nameField == null) {
                const firstProp = R.head(R.keys(f.properties!));
                title = R.prop(firstProp!, f.properties!);
            } else {
                title = R.prop(this.props.nameField, f.properties!);
            }
            const style = this.props.selectedLocation === title ?
                         {fill: "#FF0000", stroke: "#000000"} : {fill: "#eeeeee", stroke: "#000000"};
            return (
                <g key={id}>
                    <path d={path(f) || undefined} style={style} key={id} onClick={(e) => {
                        this.props.onSelectLocation(title);
                    }}/>
                    <text transform={"translate(" + projection(center) + ")"}
                         style={{ fill: "#000000", stroke: "#000000"}}>
                         {title}
                    </text>
                </g>
            );
        } , geodata.getFeatures());
        return features;
    }
}
