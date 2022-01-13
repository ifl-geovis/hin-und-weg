import Log from '../log';
import Config from '../config';
import Settings from '../settings';

/**
	Represents the application data (loaded geometries and migration and population data).
 */
export default class AppData {

	private db: alaSQLSpace.AlaSQL;

	constructor(db: alaSQLSpace.AlaSQL) {
		this.db = db;
	}

	public setDB(db: alaSQLSpace.AlaSQL) {
		this.db = db;
	}

	public getDB(): alaSQLSpace.AlaSQL {
		return this.db;
	}

}