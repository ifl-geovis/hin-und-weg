import { Panel } from "primereact/panel";
import * as React from "react";

export interface ILocationProps
{
	title: string;
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
					abc bla bloo
				</div>
			</Panel>
		);
	}

}
