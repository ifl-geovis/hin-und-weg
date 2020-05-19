import R from "ramda";
import React from "react";
import Geodata from "../../model/Geodata";
import SelectInput from "../input/SelectInput";
import MapView from "./MapView";
import NeueMapView from "./NeueMapView";
import { Checkbox } from "primereact/checkbox";

export interface IGeodataProps
{
	items?: Array<{[name: string]: any}> | null;
	geodata: Geodata | null;
	geoName: string | null;
	locations: string[];
	selectedLocation?: string | null;
	onSelectLocation: (newLocation: string) => void;
	theme: string;
}

interface IGeodataState
{
	showLabels: boolean;
}

export default class GeodataView extends React.Component<IGeodataProps, IGeodataState>
{

	constructor(props: IGeodataProps)
	{
		super(props);
		this.onShowLabelsChange = this.onShowLabelsChange.bind(this);
		this.state =
		{
			showLabels: true,
		};
	}

	public render(): JSX.Element
	{
		return (
			<div className="p-grid">

				<div className="p-col-4">
					<Checkbox inputId="showlabels" value="showlabels" onChange={this.onShowLabelsChange} checked={this.state.showLabels}></Checkbox>
					<label htmlFor="showlabels" className="p-checkbox-label">zeige Namen</label>
				</div>
				<div className="p-col-12">
					{/* <MapView geodata={this.props.geodata} nameField={this.props.geoName} items={this.props.items} selectedLocation={this.props.selectedLocation} onSelectLocation={this.props.onSelectLocation} showLabels={this.state.showLabels} theme={this.props.theme}/> */}
					<NeueMapView geodata={this.props.geodata} nameField={this.props.geoName} items={this.props.items} selectedLocation={this.props.selectedLocation} onSelectLocation={this.props.onSelectLocation} showLabels={this.state.showLabels} theme={this.props.theme}/>
				</div>

				<div className="p-col-1" > <svg> <rect key="area" fill="#cbf719" stroke="#4d4d4d" width="24" height="24" margin-right="15"></rect> </svg> </div>
				<div className="p-col-3"> - ausgewählte Bezugsfläche</div>
			</div>
		);
	}

	private onShowLabelsChange(e: { originalEvent: Event, value: string, checked: boolean})
	{
		this.setState({showLabels: e.checked});
	}

}
