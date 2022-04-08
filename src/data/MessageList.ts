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
		if (type === "error") Log.error(message);
		else if (type === "warning") Log.warning(message);
		else if (type === "success") Log.success(message);
		else Log.debug(message);
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