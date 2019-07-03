import config from './config.json';

export default class Config
{

	private static profile: string = (<any>config)["profile"];
	private static def: any = (<any>config)["default"];
	private static conf: any = (<any>config)[Config.profile];

	private static getSection(section: string): any
	{
		if (section in Config.conf) return Config.conf[section];
		if (section in Config.def) return Config.def[section];
		return null;
	}

	private static getDefaultSection(section: string): any
	{
		if (section in Config.def) return Config.def[section];
		return null;
	}

	public static getValue(section: string, key: string): any
	{
		const sec = Config.getSection(section);
		const defsec = Config.getDefaultSection(section);
		if (sec == null) return null;
		if (key in sec) return sec[key];
		if (defsec == null) return null;
		if (key in defsec) return defsec[key];
		return null;
	}

}