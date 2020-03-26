import React from "react";

import SelectInput from "../input/SelectInput";

export interface IViewSelectorProps
{
	selected?: string | null;
	views: string[];
	onSelectView: (name: string) => void;
}

export default class ViewSelector extends React.Component<IViewSelectorProps>
{

	constructor(props: IViewSelectorProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		return (
			<div>
				<SelectInput options={this.props.views} selected={this.props.selected} onSelected={this.props.onSelectView}/>
			</div>
		);
	}

}
