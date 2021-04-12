import React from 'react';

export interface IMessageProps {
	message: string;
	type: string;
}

export default class Message extends React.Component<IMessageProps> {

	constructor(props: IMessageProps) {
		super(props);
	}

	public render(): JSX.Element {
		return (
			<div className={'message-' + this.props.type}>
			{this.props.message}
			</div>
		);
	}

}
