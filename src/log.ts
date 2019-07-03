import Config from "./config";

export default class Log
{

	public static DEBUG: boolean = Config.getValue("logging", "debug");
	public static TRACE: boolean = Config.getValue("logging", "trace");

	public static log(level: boolean, message: string, some?: any)
	{
		if (level)
		{
			if (some == undefined)
			{
				// tslint:disable-next-line: no-console
				console.log(message);
			}
			else
			{
				// tslint:disable-next-line: no-console
				console.log(message, some);
			}
		}
	}

	public static debug(message: string, some?: any)
	{
		Log.log(Log.DEBUG, message, some);
	}

	public static trace(message: string, some?: any)
	{
		Log.log(Log.TRACE, message, some);
	}

}