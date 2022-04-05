import fs from 'fs';
import os from 'os';

import Log from './log';

export default class Project {

	private static data: any = JSON.parse('{}');

	/*public static load() {
		try {
			Settings.fixSavepathForMac();
			Settings.settings = JSON.parse(fs.readFileSync(Settings.savepath, 'utf8'));
		} catch (e) {
			Log.debug("Could not load file " + Settings.savepath + ": " + e);
		}
	}*/

	public static save(path: string) {
		try {
			fs.writeFileSync(path, JSON.stringify(Project.data), 'utf8');
		} catch (e) {
			Log.debug("Could not write file " + path + ": " + e);
		}
	}

}