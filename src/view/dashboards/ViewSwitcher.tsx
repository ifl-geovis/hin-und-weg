import React from "react";

import Config from "../../config";
import Log from "../../log";

import ViewSelector from "./ViewSelector";

import SystemInfo from "../../components/SystemInfo";

export interface IViewSwitcherProps
{
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
			activeView: "file",
		};
	}

	public render(): JSX.Element
	{
		let views = this.getVisibleViews();
		let showedView = this.selectCurrentView(this.state.activeView);
		return (
			<div className="viewswitcher">
				<div className="p-grid">
					<div className="p-col-4">Ansicht wählen:</div>
					<div className="p-col-8">
						<ViewSelector views={views} selected={this.state.activeView} onSelectView={this.onViewSelect}/>
					</div>
					<div className="p-col-12">
						{showedView}
					</div>
				</div>
			</div>
		);
	}

	private onViewSelect(selected: string)
	{
		Log.debug("selected view: " + selected);
		this.setState({activeView: selected});
	}

	private getVisibleViews()
	{
		let views: any[] = [];
		this.addView(views, "file", "Datei");
		this.addView(views, "systeminfo", "Systeminformationen");
		return views;
	}

	private addView(views: any[], value: string, label: string)
	{
		if (Config.getValue("components", value) == true)
		{
			views.push({value: value, label: label});
		}
	}

	private selectCurrentView(view: string)
	{
		if (view == "systeminfo") return this.selectSystemInfoView();
		return (
			<div className="p-col-12">
				<div>Die Ansicht {view} ist unbekannt.</div>
			</div>
		);
	}

	private selectSystemInfoView()
	{
		return (
			<div className="p-col-12">
				<SystemInfo />
			</div>
		);
	}

}
