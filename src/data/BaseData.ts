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

	private appdata: AppData;

	constructor(appdata: AppData) {
		this.appdata = appdata;
	}

	public setAppData(appdata: AppData) {
		this.appdata = appdata;
	}

	public getAppData(): AppData {
		return this.appdata;
	}

}