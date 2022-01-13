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

}