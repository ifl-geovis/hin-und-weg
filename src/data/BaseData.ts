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
	private dataprocessing: string;

	constructor(appdata: AppData) {
		this.change = () => {};
		this.appdata = appdata;
		this.theme = 'Von';
		this.dataprocessing = 'absolute';
	}

	public setChange(change: () => void) {
		this.change = change;
	}

	public update() {
		this.change();
	}

	public setAppData(appdata: AppData) {
		this.appdata = appdata;
	}

	public getAppData(): AppData {
		return this.appdata;
	}

	public setTheme(theme: string) {
		this.theme = theme;
		this.update();
	}

	public getTheme(): string {
		return this.theme;
	}

	public setDataProcessing(dataprocessing: string) {
		this.dataprocessing = dataprocessing;
		this.update();
	}

	public getDataProcessing(): string {
		return this.dataprocessing;
	}

}