import * as d3 from "d3";
import { Feature } from "geojson";
import R from "ramda";
import React from "react";
import Geodata from "../../model/Geodata";

export interface IMapViewProps {
    items?: Array<{[name: string]: any}> | null;
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

    // Taken from http://colorbrewer2.org/
    protected colors = ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"];

    constructor(props: IMapViewProps) {
        super(props);
        this.state = {
            height: 700,
            width: 600,
        };
    }

    public render(): JSX.Element {
        const [min, max] = this.getMinMax();
        return (
            <div className="p-grid">
                <svg className="p-col-11" width={this.state.width} height={this.state.height}>
                    {this.createD3Map()}
                </svg>
                <svg className="p-col-1" width="24" height="270">
                    <rect fill="rgb(255,247,251)" width="24" height="24" y="0"><text>{min}</text></rect>
                    <rect fill="rgb(236,231,242)" width="24" height="24" y="24"></rect>
                    <rect fill="rgb(208,209,230)" width="24" height="24" y="48"></rect>
                    <rect fill="rgb(166,189,219)" width="24" height="24" y="72"></rect>
                    <rect fill="rgb(116,169,207)" width="24" height="24" y="96"></rect>
                    <rect fill="rgb(54,144,192)" width="24" height="24" y="120"></rect>
                    <rect fill="rgb(5,112,176)" width="24" height="24" y="144"></rect>
                    <rect fill="rgb(4,90,141)" width="24" height="24" y="168"></rect>
                    <rect fill="rgb(2,56,88)" width="24" height="24" y="192"><text>{max}</text></rect>
                </svg>
            </div>
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
            const center = projection(d3.geoCentroid(f));
            let title = "";
            if (this.props.nameField == null) {
                const firstProp = R.head(R.keys(f.properties!));
                title = R.prop(firstProp!, f.properties!);
            } else {
                title = R.prop(this.props.nameField, f.properties!);
            }
            const style = this.getStyleFor(title, f);
            return (
                <g key={id}>
                    <path d={path(f) || undefined} style={style} key={id} onClick={(e) => {
                        this.props.onSelectLocation(title);
                    }}/>
                    <text x={(center == null) ? 0 : center["0"]} y={(center == null) ? 0 : center["1"]}
                         dominantBaseline="middle" textAnchor="middle"
                         style={{fontSize: "small"}} pointerEvents="none">
                         {title}
                    </text>
                </g>
            );
        } , geodata.getFeatures());
        return features;
    }

    private getStyleFor(title: string, feature: Feature): object {
        if ( this.props.selectedLocation === title) {
            return {fill: "#FFFFFF", stroke: "#000000"};
        } else {
            if (!this.props.items) {
                return {fill: "#FFFFFF", stroke: "#000000"};
            }
            const vons = R.uniq(R.map((item) => item.Von, this.props.items));
            const field = R.length(vons) === 1 ? "Nach" : "Von";
            const itemForFeature = R.find((item) => item[field] === title, this.props.items);
            if (!itemForFeature) {
                return {fill: "#FFFFFF", stroke: "#000000"};
            }
            const value = parseInt(itemForFeature.Wert, 10);
            const colorProvider = d3.scaleQuantize<string>().domain(this.getMinMax()).range(this.colors);
            return {fill: colorProvider(value), stroke: "#000000"};
        }
    }

    private getMinMax(): [number, number] {
        let max = 0;
        let min = 0;
        if (this.props.items) {
            max = R.reduce((acc, item) => R.max(acc, item.Wert), Number.MIN_VALUE, this.props.items);
            min = R.reduce((acc, item) => R.min(acc, item.Wert), Number.MAX_VALUE, this.props.items);
        }
        return [min, max];
    }
}