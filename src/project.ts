import fs from 'fs';
import os from 'os';

import Log from './log';

export default class Project {

	private static data: any = JSON.parse('{}');

	/*public static load(path: string) {
		try {
			Project.data = JSON.parse(fs.readFileSync(path, 'utf8'));
		} catch (e) {
			Log.debug("Could not load file " + path + ": " + e);
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