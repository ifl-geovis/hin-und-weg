import React from "react";

import ComparisonView from "./dashboards/ComparisonView";

export interface IAppProps
{
	db: alaSQLSpace.AlaSQL;
}

export default class App extends React.Component<IAppProps>
{

	constructor(props: IAppProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		return (
			<ComparisonView db={this.props.db}/>
		);
	}

}