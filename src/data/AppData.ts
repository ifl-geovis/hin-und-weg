import Log from '../log';
import Config from '../config';
import Settings from '../settings';

/**
	Represents the application data (loaded geometries and migration and population data).
 */
export default class AppData {

	private change: () => void;
	private db: alaSQLSpace.AlaSQL;

	constructor(db: alaSQLSpace.AlaSQL) {
		this.change = () => {};
		this.db = db;
	}

	public setChange(change: () => void) {
		this.change = change;
	}

	public setDB(db: alaSQLSpace.AlaSQL) {
		this.db = db;
	}

	public getDB(): alaSQLSpace.AlaSQL {
		return this.db;
	}

	public getAvailableYears(): string[] {
		let years = [];
		const results = this.db('SELECT DISTINCT Jahr FROM matrices ORDER BY Jahr');
		for (let row of results) {
			if (row.Jahr) years.push(row.Jahr);
		}
		return years;
	}

	public gatherAppData()
	{
		let results: any = {};
		results.db = this.gatherDBData();
		return results;
	}

	private gatherDBData()
	{
		let results: any = {};
		const db = this.getDB();
		for (const tablename of ["matrices", "population"]) {
			let tableresults = db(`SELECT * FROM ${tablename}`);
			results[tablename] = tableresults;
		}
		return results;
	}

}