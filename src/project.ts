import fs from 'fs';
import os from 'os';

import Log from './log';

export default class Project {

	private static data: any = JSON.parse('{}');
	private static loaded: string[] = [];

	public static load(path: string) {
		try {
			Project.loaded = [];
			Project.data = JSON.parse(fs.readFileSync(path, 'utf8'));
		} catch (e) {
			Log.debug("Could not load file " + path + ": " + e);
		}
	}

	public static save(path: string) {
		try {
			fs.writeFileSync(path, JSON.stringify(Project.data), 'utf8');
		} catch (e) {
			Log.debug("Could not write file " + path + ": " + e);
		}
	}

	public static addData(key: string, values: any) {
		Project.data[key] = values;
	}

	public static getData(key: string): any {
		if (Project.isLoaded(key)) return null;
		// @ts-ignore
		Project.loaded.push(key);
		return Project.data[key];
	}

	private static isLoaded(key: string): boolean {
		for(const value of Project.loaded) {
			if (key === value) return true;
		}
		return false;
	}

}