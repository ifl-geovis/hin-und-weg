import * as React from "react";

import Config from "../../config";

export interface IIndexViewProps {
	db: alaSQLSpace.AlaSQL;
}

interface IIndexViewState {
	indexValue: number;
}

export default class IndexView extends React.Component<IIndexViewProps, IIndexViewState>
{

	constructor(props: IIndexViewProps) {
		super(props);
		this.state = {
			indexValue: 0,
		};
	}

	public render(): JSX.Element
	{
		return (
			<div>
				<h3>Indexwerte</h3> <hr/>
			</div>
		);
	}
}