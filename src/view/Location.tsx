import { Panel } from "primereact/panel";
import * as React from "react";
import SelectInput from "./input/SelectInput";

export interface ILocationProps
{
	title: string;
	locations: string[];
	selectedLocation: string | null;
	onSelectLocation: (newLocation: string) => void;
}

export default class Location extends React.Component<ILocationProps>
{

	constructor(props: ILocationProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		return (
			<Panel header={this.props.title}>
				<div className="p-grid" style={{ margin: "10px" }}>
					<div className="p-col-12">
						<SelectInput options={this.props.locations} selected={this.props.selectedLocation} onSelected={this.props.onSelectLocation}/>
					</div>
				</div>
			</Panel>
		);
	}

}
