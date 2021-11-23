import React from 'react';
import { Button } from 'primereact/button';

import MessageList from '../../data/MessageList';

import Message from './Message';
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface IMessagesProps extends WithNamespaces{
	change: () => void;
}

// export default 
class Messages extends React.Component<IMessagesProps> {

	constructor(props: IMessagesProps) {
		super(props);
		this.removeMessages = this.removeMessages.bind(this);
	}

	public render(): JSX.Element {
		let messages = MessageList.getMessageList().getMessages();
		let types = MessageList.getMessageList().getTypes();
		let widgets = [];
		for (let index in messages) {
			widgets.push(this.createMessageWidget(index, messages[index], types[index]));
		}
		let remove = this.createRemoveButton(widgets.length > 0);
		return (
			<div className="noprint">
				{remove}
				{widgets}
			</div>
		);
	}

	private createMessageWidget(index: string, message: string, type: string) {
		const {t}:any = this.props ;
		return (
			<Message key={"message-" + index} message={t(message)} type={type} />
		);
	}

	private removeMessages() {
		MessageList.getMessageList().clear();
		this.props.change();
	}

	private createRemoveButton(visible: boolean) {
		const {t}:any = this.props ;
		if (!visible) return (<span></span>);
		return (
			<Button key="message-remove-button" label={t('messages')} onClick={this.removeMessages} className="p-button-link p-button-sm" />
		);
	}

}
export default withNamespaces()(Messages);
