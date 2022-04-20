import fs from 'fs';
import os from 'os';
import Config from "./config";

export default class Log
{

	private static filename: string = "";

	public static ERROR: boolean = Config.getValue("logging", "error");
	public static WARNING: boolean = Config.getValue("logging", "warning");
	public static SUCCESS: boolean = Config.getValue("logging", "success");
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
				fs.appendFileSync(Log.getSavePath(), message + '\n', 'utf8');
			}
			else
			{
				// tslint:disable-next-line: no-console
				console.log(message, some);
				fs.appendFileSync(Log.getSavePath(), message + some + '\n', 'utf8');
			}
		}
	}

	private static getSavePath()
	{
		const logdir = (process.platform === 'darwin') ? os.homedir() + "/hin&weg-logs" : "./hin&weg-logs";
		if (!fs.existsSync(logdir))
		{
			fs.mkdirSync(logdir);
		}
		if (Log.filename === "")
		{
			const date = new Date();
			Log.filename = date.toISOString();
		}
		return logdir + "/"+ Log.filename;
	}

	public static error(message: string, some?: any)
	{
		Log.log(Log.ERROR, message, some);
	}

	public static warning(message: string, some?: any)
	{
		Log.log(Log.WARNING, message, some);
	}

	public static success(message: string, some?: any)
	{
		Log.log(Log.SUCCESS, message, some);
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