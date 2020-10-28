import fs from 'fs';

import Config from "./config";
import Log from './log';

export default class Settings
{

	private static savepath: string = '.hin&weg';
	private static settings: any = JSON.parse('{}');

	public static load()
	{
		try {
			Settings.settings = JSON.parse(fs.readFileSync(Settings.savepath, 'utf8'));
		} catch (e) {
			Log.debug("Couldnot load file " + Settings.savepath + ": " + e);
		}
	}

}