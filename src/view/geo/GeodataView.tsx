import R from "ramda";
import React from "react";
import Geodata from "../../model/Geodata";
import SelectInput from "../input/SelectInput";
import MapView from "./MapView";
import { Checkbox } from "primereact/checkbox";

export interface IGeodataProps
{
	items?: Array<{[name: string]: any}> | null;
	geodata: Geodata | null;
	geoName: string | null;
	locations: string[];
	selectedLocation?: string | null;
	onSelectLocation: (newLocation: string) => void;
	showLabels: boolean;
	setShowLabels: (show: boolean) => void;
}

export default class GeodataView extends React.Component<IGeodataProps>
{

	constructor(props: IGeodataProps)
	{
		super(props);
		this.onShowLabelsChange = this.onShowLabelsChange.bind(this);
	}

	public render(): JSX.Element
	{
		return (
			<div className="p-grid">

				<div className="p-col-4">
					<Checkbox inputId="showlabels" value="showlabels" onChange={this.onShowLabelsChange} checked={this.props.showLabels}></Checkbox>
					<label htmlFor="showlabels" className="p-checkbox-label">zeige Namen</label>
				</div>
				<div className="p-col-12">
					<MapView geodata={this.props.geodata} nameField={this.props.geoName} items={this.props.items} selectedLocation={this.props.selectedLocation} onSelectLocation={this.props.onSelectLocation} showLabels={this.props.showLabels} />
				</div>
			</div>
		);
	}

	private onShowLabelsChange(e: { originalEvent: Event, value: string, checked: boolean})
	{
		this.props.setShowLabels(e.checked);
	}

}
