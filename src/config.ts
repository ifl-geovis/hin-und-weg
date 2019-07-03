import config from './config.json';

export default class Config
{

	private static profile: string = (<any>config).profile;
	private static def: any = (<any>config).default;
	private static conf: any = (<any>config)[Config.profile];

	public static getValue(key: string): boolean
	{
		if (key in Config.conf) return Config.conf[key];
		if (key in Config.def) return Config.def[key];
		return null;
	}

}