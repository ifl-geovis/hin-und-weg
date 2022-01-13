import AppData from './AppData';

import Log from '../log';
import Config from '../config';
import Settings from '../settings';

export interface Item {
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

/**
	Represents the state of a BaseView instance.
 */
export default class BaseData {

	private change: () => void;
	private appdata: AppData;
	private theme: string;

	constructor(appdata: AppData) {
		this.change = () => {};
		this.appdata = appdata;
		this.theme = 'Von';
	}

	public setChange(change: () => void) {
		this.change = change;
	}

	public setAppData(appdata: AppData) {
		this.appdata = appdata;
	}

	public getAppData(): AppData {
		return this.appdata;
	}

	public setTheme(theme: string) {
		this.theme = theme;
		this.change();
	}

	public getTheme(): string {
		return this.theme;
	}

}