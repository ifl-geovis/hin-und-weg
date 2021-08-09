import fs from 'fs';

import Config from "./config";
import Log from './log';

export default class Settings {

	private static savepath: string = './.hin&weg';
	private static settings: any = JSON.parse('{}');

	public static load() {
		try {
			Settings.settings = JSON.parse(fs.readFileSync(Settings.savepath, 'utf8'));
		} catch (e) {
			Log.debug("Could not load file " + Settings.savepath + ": " + e);
		}
	}

	public static save() {
		try {
			fs.writeFileSync(Settings.savepath, JSON.stringify(Settings.settings), 'utf8');
		} catch (e) {
			Log.debug("Could not write file " + Settings.savepath + ": " + e);
		}
	}

	private static getSection(section: string): any {
		if (section in Settings.settings) return Settings.settings[section];
		return null;
	}

	public static getSettings(): any {
		return Settings.settings;
	}

	public static getValue(section: string, key: string): any {
		const sec = Settings.getSection(section);
		if ((sec != null) && (key in sec)) return sec[key];
		return Config.getValue(section, key);
	}

	public static setValue(section: string, key: string, value: any) {
		if (Settings.getSection(section) == null) Settings.settings[section] = {};
		Settings.settings[section][key] = value;
	}

}