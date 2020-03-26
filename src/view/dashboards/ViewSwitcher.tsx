import React from "react";
import ViewSelector from "./ViewSelector";

export interface IViewSwitcherProps
{
	views: string[];
}

interface IViewSwitcherState
{
	activeView: string;
}

export default class ViewSwitcher extends React.Component<IViewSwitcherProps, IViewSwitcherState>
{

	constructor(props: IViewSwitcherProps)
	{
		super(props);
		this.onViewSelect = this.onViewSelect.bind(this);
		this.state =
		{
			activeView: "Datei",
		};
	}

	public render(): JSX.Element
	{
		return (
			<div className="viewswitcher">
				<div className="p-grid">
					<div className="p-col-4">Ansicht wählen:</div>
					<div className="p-col-8">
						<ViewSelector views={this.props.views} selected={this.state.activeView} onSelectView={this.onViewSelect}/>
					</div>
					<div className="p-col-12">
						<div>test123: {this.state.activeView}</div>
					</div>
				</div>
			</div>
		);
	}

	private onViewSelect(selected: string)
	{
		this.setState({activeView: selected});
	}

}
