import React from "react";

export interface IColorPickProps {
	id: string;
	value: string;
	onChange: (event: any) => void;
}

export default class ColorPick extends React.Component<IColorPickProps> {

	constructor(props: IColorPickProps) {
		super(props);
		this.change = this.change.bind(this);
	}

	public render(): JSX.Element {
		const color = (this.props.value.startsWith("#")) ? this.props.value : "#" + this.props.value;
		const colorisstyle =
		{
			color: color,
			backgroundColor: color,
		};
		console.log(this.props.value);
		console.log(colorisstyle);
		return (
			<input id={this.props.id} className="coloris" type="text" value={"#" + this.props.value} onChange={this.change} onInput={this.change} style={colorisstyle} data-coloris />
		);
	}

	private change(event: any) {
		console.log("onChange");
		console.log(event);
		this.props.onChange(event);
	}
}