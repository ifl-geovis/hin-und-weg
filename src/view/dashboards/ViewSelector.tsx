import { Dropdown } from "primereact/dropdown";
import React from "react";

export interface IViewItem
{
	label: string;
	value: string;
}

export interface IViewSelectorProps
{
	selected?: string | null;
	views: IViewItem[];
	onSelectView: (name: string) => void;
}

export default class ViewSelector extends React.Component<IViewSelectorProps>
{

	constructor(props: IViewSelectorProps)
	{
		super(props);
		this.onSelected = this.onSelected.bind(this);
	}

	public render(): JSX.Element
	{
		return (
			<div>
				<Dropdown value={this.props.selected} options={this.props.views} onChange={this.onSelected} style={{ width: "100%" }} />
			</div>
		);
	}

	private onSelected(event: { originalEvent: Event, value: any})
	{
		this.props.onSelectView(event.value);
	}

}
