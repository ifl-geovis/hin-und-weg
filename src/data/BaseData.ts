import AppData from './AppData';
import Classification from './Classification';
import ViewData from './ViewData';

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
	private classification: Classification;
	private viewdata: ViewData;

	private theme: string;
	private dataprocessing: string;
	private location: string | null;
	private migrationsinside: boolean;
	private years: string[];

	private cached_query: string | null;
	private cached_results: any[] | null;

	constructor(appdata: AppData) {
		this.change = () => {};
		this.appdata = appdata;
		this.classification = new Classification(this);
		this.viewdata = new ViewData(this);
		this.theme = 'Von';
		this.dataprocessing = 'absolute';
		this.location = null;
		this.migrationsinside = true;
		this.years = [];
		// cached values initialized with null
		this.cached_query = null;
		this.cached_results = null;
	}

	public setChange(change: () => void) {
		this.change = change;
	}

	public update() {
		this.change();
		// set cached values back to null
		this.cached_query = null;
		this.cached_results = null;
	}

	public gatherBaseData()
	{
		let results: any = {};
		results.theme = this.theme;
		results.dataprocessing = this.dataprocessing;
		results.location = this.location;
		results.migrationsinside = this.migrationsinside;
		results.years = this.years;
		return results;
	}

	public restoreBaseData(data: any)
	{
		if (!data) return;
		this.theme = data.theme;
		this.dataprocessing = data.dataprocessing;
		this.location = data.location;
		this.migrationsinside = data.migrationsinside;
		this.years = data.years;
		this.update();
	}

	public setAppData(appdata: AppData) {
		this.appdata = appdata;
	}

	public getAppData(): AppData {
		return this.appdata;
	}

	public getClassification(): Classification {
		return this.classification;
	}

	public getViewData(): ViewData {
		return this.viewdata;
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


	public getAvailableYears(): string[] {
		return this.appdata.getAvailableYears();
	}


	private standardizeValues(value: number): number
	{
		if ((this.dataprocessing === 'wanderungsrate') || (this.dataprocessing === 'ratevon') || (this.dataprocessing === 'ratenach')) return Math.round((value + Number.EPSILON) * 1000) / 1000;
		if (this.dataprocessing === 'absolute') return Math.round(value);
		return value;
	}

	private constructQuery(): string {
		if (this.cached_query != null) return this.cached_query;
		this.cached_query = this.constructNewQuery();
		return this.cached_query;
	}

	private constructNewQuery(): string {
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

	public query(): any[] {
		if (this.cached_results != null) return this.cached_results;
		this.cached_results = this.newQuery();
		return this.cached_results;
	}

	private newQuery(): any[] {
		const db = this.appdata.getDB();
		let results: any[] = [];
		if (this.location == null) return results;
		if (this.getAvailableYears().length == 0) return results;
		let query = '';
		if (this.theme === 'Von') {
			query = this.constructQuery();
		} else if (this.theme === 'Nach') {
			query = this.constructQuery();
		} else if (this.theme === 'Saldi') {
			const years = this.years;
			let stringYears = '';
			for (let year of this.years) {
				if (stringYears != '') stringYears += ', ';
				stringYears += `'${year}'`;
			}
			const migrationsInsideClause = (this.migrationsinside) ? `` : ` AND Von <> Nach `;
			const vonQuery = `SELECT '${this.location}' as Von, Nach, MYSUM(Wert) as Wert FROM matrices WHERE Von = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			const nachQuery = `SELECT Von, '${this.location}' as Nach, MYSUM(Wert) as Wert FROM matrices WHERE Nach = '${this.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
			const vonResults = db(vonQuery);
			const nachResults = db(nachQuery);
			const popquery = `SELECT MYSUM(Wert) as population FROM population WHERE Area = '${this.location}' AND Jahr IN (${stringYears}) GROUP BY Area`;
			const popResults = db(popquery);
			for (let i = 0; i < nachResults.length; i++) {
				let value = nachResults[i].Wert - vonResults[i].Wert;
				if (isNaN(value))
				{
					if (isNaN(nachResults[i].Wert)) value = 0 - vonResults[i].Wert;
					if (isNaN(vonResults[i].Wert)) value = nachResults[i].Wert;
				}
				if ((this.dataprocessing === 'wanderungsrate') || (this.dataprocessing === 'ratevon') || (this.dataprocessing === 'ratenach')) {
					value = value * 1000 / popResults[0].population;

				}
				const saldiItem = { Von: nachResults[i].Von, Nach: nachResults[i].Nach, Wert: this.standardizeValues(value) };
				results.push(saldiItem);
			}
			for (let i = 0; i < results.length; i++) {
				if (typeof results[i].Wert == 'undefined') results[i].Wert = Number.NaN;
			}
			Log.trace('results: ', results);
			return results;
		}
		results = db(query);
		for (let i = 0; i < results.length; i++) {
			if (typeof results[i].Wert == 'undefined') results[i].Wert = Number.NaN;
			results[i].Wert = this.standardizeValues(results[i].Wert);
		}
		Log.trace('results: ', results);
		return results;
	}

}