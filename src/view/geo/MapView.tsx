import * as d3 from "d3";
import { Feature } from "geojson";
import R from "ramda";
import React from "react";
import Geodata from "../../model/Geodata";

export interface IMapViewProps
{
	items?: Array<{[name: string]: any}> | null;
	geodata: Geodata | null;
	nameField?: string | null;
	selectedLocation?: string | null;
	onSelectLocation: (newLocation: string) => void;
	showLabels: boolean;
}

interface IMapViewState
{
	width: number;
	height: number;
}

export default class MapView extends React.Component<IMapViewProps, IMapViewState>
{

	// Taken from http://colorbrewer2.org/
	// http://colorbrewer2.org/?type=sequential&scheme=PuBu&n=9
	protected colors = ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"];
	protected neutral_color = '#ffffff';
	// http://colorbrewer2.org/?type=sequential&scheme=YlOrRd&n=9
	protected negative_colors = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'];

	constructor(props: IMapViewProps)
	{
		super(props);
		this.state =
		{
			height: 700,
			width: 600,
		};
		this.pickColor = this.pickColor.bind(this);
	}

	public render(): JSX.Element
	{
		const [min, max] = this.getMinMax();
		return (
			<div className="p-grid">
				<svg className="p-col-11" width={this.state.width} height={this.state.height}>
					{this.createD3Map()}
					{this.createMapLabels()}
				</svg>
				<svg className="p-col-1" width="24" height="270">
					{this.createLegend(this.colors, 0)}
					{this.createLegend(this.negative_colors, 1)}
				</svg>
			</div>
		);
	}

	private createLegend(colors: string[], offset: number): object[]
	{
		let y = 0;
		const indexedMap = R.addIndex(R.map);
		const boxes = indexedMap( (color, id: number): JSX.Element =>
		{
			let y = id * 24;
			let x = offset * 24;
			let c = color as string;
			return (<rect key={id} fill={c} width="24" height="24" x={x} y={y}></rect>);
		}, colors);
		return boxes;
	}

	private createD3Map(): object[]
	{
		const geodata = this.props.geodata;
		if (geodata == null)
		{
			return [
				<g key="no-geodata">
					<text transform={"translate(" + this.state.width / 2 + "," + this.state.height / 2 + ")"} style={{ fill: "#000000", stroke: "#aaaaaa"}}>Keine Geodaten geladen</text>
				</g>,
			];
		}
		const projection = d3.geoMercator().fitSize([this.state.width, this.state.height],geodata.getFeatureCollection());
		const path = d3.geoPath().projection(projection);
		const indexedMap = R.addIndex(R.map);
		const features = indexedMap( (feature, id: number): JSX.Element =>
		{
			const f = feature as Feature;
			let title = "";
			if (this.props.nameField == null)
			{
				const firstProp = R.head(R.keys(f.properties!));
				title = R.prop(firstProp!, f.properties!);
			}
			else
			{
				title = R.prop(this.props.nameField, f.properties!);
			}
			const style = this.getStyleFor(title, f);
			return (
				<g key={id}>
					<path d={path(f) || undefined} style={style} key={id} onClick={(e) =>
						{
							this.props.onSelectLocation(title);
						}}/>
				</g>
			);
		} , geodata.getFeatures());
		return features;
	}

	private createMapLabels(): object[]
	{
		const geodata = this.props.geodata;
		if ((geodata == null) || (this.props.showLabels == false))
		{
			return [];
		}
		const projection = d3.geoMercator().fitSize([this.state.width, this.state.height],geodata.getFeatureCollection());
		const path = d3.geoPath().projection(projection);
		const indexedMap = R.addIndex(R.map);
		const labels = indexedMap( (feature, id: number): JSX.Element =>
		{
			const f = feature as Feature;
			const center = projection(d3.geoCentroid(f));
			let title = "";
			if (this.props.nameField == null)
			{
				const firstProp = R.head(R.keys(f.properties!));
				title = R.prop(firstProp!, f.properties!);
			}
			else
			{
				title = R.prop(this.props.nameField, f.properties!);
			}
			return (
				<g key={id}>
					<text x={(center == null) ? 0 : center["0"]} y={(center == null) ? 0 : center["1"]} dominantBaseline="middle" textAnchor="middle" style={{fontSize: "small"}} pointerEvents="none">
						{title}
					</text>
				</g>
			);
		}, geodata.getFeatures());
		return labels;
	}

	private getStyleFor(title: string, feature: Feature): object
	{
		if ( this.props.selectedLocation === title)
		{
			return {fill: "#FFFFFF", stroke: "#000000"};
		}
		else
		{
			if (!this.props.items)
			{
				return {fill: "#FFFFFF", stroke: "#000000"};
			}
			const vons = R.uniq(R.map((item) => item.Von, this.props.items));
			const field = R.length(vons) === 1 ? "Nach" : "Von";
			const itemForFeature = R.find((item) => item[field] === title, this.props.items);
			if (!itemForFeature)
			{
				return {fill: "#FFFFFF", stroke: "#000000"};
			}
			const value = parseInt(itemForFeature.Wert, 10);
			const colorProvider = this.pickColor;
			return {fill: colorProvider(value), stroke: "#000000"};
		}
	}

	private pickColor(value: number): string
	{
		if (value === 0)
		{
			return this.neutral_color;
		}
		else if (value > 0)
		{
			const [min, max] = this.getMinMax();
			const positive = d3.scaleQuantize<string>().domain([1, max]).range(this.colors);
			return positive(value);
		}
		else if (value < 0)
		{
			const [min, max] = this.getMinMax();
			const negative = d3.scaleQuantize<string>().domain([1, - min]).range(this.negative_colors);
			return negative(- value);
		}
		return this.neutral_color;
	}

	private getMinMax(): [number, number] {
		let max = 0;
		let min = 0;
		if (this.props.items)
		{
			let normalizedData = R.reject((item) => item.Von === item.Nach, this.props.items);
			max = R.reduce((acc, item) => R.max(acc, item.Wert), Number.MIN_VALUE, normalizedData);
			min = R.reduce((acc, item) => R.min(acc, item.Wert), Number.MAX_VALUE, normalizedData);
		}
		return [min, max];
	}
}