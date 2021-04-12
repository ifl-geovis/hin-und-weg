import Log from '../log';

/**
	Holds a list of global messages.
 */
export default class MessageList {

	private messages: string[] = [];
	private types: string[] = [];

	private static current: MessageList = new MessageList();

	public static getMessageList(): MessageList {
		return MessageList.current;
	}

	public addMessage(message: string, type: string) {
		this.messages.push(message);
		this.types.push(type);
	}

	public clear() {
		this.messages = [];
		this.types = [];
	}

	public getMessages(): string[] {
		return this.messages;
	}

	public getTypes(): string[] {
		return this.types;
	}

}