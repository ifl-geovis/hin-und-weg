import React from 'react';
import { Button } from 'primereact/button';

import MessageList from '../../data/MessageList';

import Message from './Message';

export interface IMessagesProps {
	change: () => void;
}

export default class Messages extends React.Component<IMessagesProps> {

	constructor(props: IMessagesProps) {
		super(props);
		this.removeMessages = this.removeMessages.bind(this);
	}

	public render(): JSX.Element {
		let messages = MessageList.getMessageList().getMessages();
		let types = MessageList.getMessageList().getTypes();
		let widgets = [];
		for (let index in messages) {
			widgets.push(this.createMessageWidget(messages[index], types[index]));
		}
		let remove = this.createRemoveButton(widgets.length > 0);
		return (
			<div className="noprint">
				{remove}
				{widgets}
			</div>
		);
	}

	private createMessageWidget(message: string, type: string) {
		return (
			<Message message={message} type={type} />
		);
	}

	private removeMessages() {
		MessageList.getMessageList().clear();
		this.props.change();
	}

	private createRemoveButton(visible: boolean) {
		if (!visible) return (<span></span>);
		return (
			<Button label="Benachrichtigungen entfernen" onClick={this.removeMessages} />
		);
	}

}