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
	private location: string | null;
	private migrationsinside: boolean;
	private years: string[];

	private cached_query: string | null;

	constructor(appdata: AppData) {
		this.change = () => {};
		this.appdata = appdata;
		this.theme = 'Von';
		this.dataprocessing = 'absolute';
		this.location = null;
		this.migrationsinside = true;
		this.years = [];
		// cached values initialized with null
		this.cached_query = null;
	}

	public setChange(change: () => void) {
		this.change = change;
	}

	public update() {
		this.change();
		// set cached values back to null
		this.cached_query = null;
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

	public setLocation(location: string | null) {
		this.location = location;
		this.update();
	}

	public getLocation(): string | null {
		return this.location;
	}

	public setMigrationsInside(migrationsinside: boolean) {
		this.migrationsinside = migrationsinside;
		this.update();
	}

	public getMigrationsInside(): boolean {
		return this.migrationsinside;
	}

	public setYears(years: string[]) {
		this.years = years;
		this.update();
	}

	public getYears(): string[] {
		return this.years;
	}


	public constructQuery(): string {
		if (this.cached_query != null) return this.cached_query;
		let stringYears = '';
		for (let year of this.years) {
			if (stringYears != '') stringYears += ', ';
			stringYears += `'${year}'`;
		}
		const migrationsInsideClause = (this.migrationsinside) ? `` : ` AND Von <> Nach `;
		if (this.theme === 'Von')
		{
			if (this.dataprocessing === 'wanderungsrate') return `SELECT '${this.location}' as Von, Nach, ROUND(MYAVG(RateVon), 3) as Wert FROM matrices WHERE Von = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			if (this.dataprocessing === 'ratevon') return `SELECT '${this.location}' as Von, Nach, ROUND(MYAVG(RateVon), 3) as Wert FROM matrices WHERE Von = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			if (this.dataprocessing === 'ratenach') return `SELECT '${this.location}' as Von, Nach, ROUND(MYAVG(RateNach), 3) as Wert FROM matrices WHERE Von = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			// fallback for absolute and other values
			return `SELECT '${this.location}' as Von, Nach, MYSUM(Wert) as Wert FROM matrices WHERE Von = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
		}
		if (this.theme === 'Nach')
		{
			if (this.dataprocessing === 'wanderungsrate') return `SELECT Von, '${this.location}' as Nach, ROUND(MYAVG(RateNach), 3) as Wert FROM matrices WHERE Nach = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
			if (this.dataprocessing === 'ratevon') return `SELECT Von, '${this.location}' as Nach, ROUND(MYAVG(RateVon), 3) as Wert FROM matrices WHERE Nach = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
			if (this.dataprocessing === 'ratenach') return `SELECT Von, '${this.location}' as Nach, ROUND(MYAVG(RateNach), 3) as Wert FROM matrices WHERE Nach = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
			// fallback for absolute and other values
			return `SELECT Von, '${this.location}' as Nach, MYSUM(Wert) as Wert FROM matrices WHERE Nach = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
		}
		return '';
	}

}