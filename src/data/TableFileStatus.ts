import assert from "assert";

/**
 * Represents the Tablefiles to load and their status.
 */
export default class TableFileStatus
{

	private path: string;
	private status: string;
	private message: string;

	constructor(path: string)
	{
		assert(path != null, "path shouldn't be null");
		assert(path != "", "path shouldn't be empty");
		this.path = path;
		this.status = "running";
		this.message = "Daten werden geladen…"
	}

	public getPath(): string
	{
		return this.path
	}

	public getStatus(): string
	{
		return this.status
	}

	public getMessage(): string
	{
		return this.message
	}

}