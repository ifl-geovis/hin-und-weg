const fs = require('fs');
const path = require('path');
import Settings from '../settings';

export interface IOfflineMaps {
	label: string;
	file: string;
	bounds: any;
}

export default class OfflineMaps {
	private static current: OfflineMaps = new OfflineMaps();

	private missingImageFiles: Array<string> = [];
	// private wrongCoordinates: Array<any> = [];

	private offlineMaps: Array<IOfflineMaps> = [
		{
			'label': 'Keine',
			'file': '',
			'bounds': [],
		},
	];

	public lonBounds = {
		max: 56,
		min: 47,
	};
	public latBounds = {
		max: 16,
		min: 4.5,
	};

	public static getCurrentOfflineMaps(): OfflineMaps {
		return OfflineMaps.current;
	}

	public getData(): Array<IOfflineMaps> {
		return this.offlineMaps;
	}

	public getMissingImageFiles(): Array<string> {
		return this.missingImageFiles;
	}

	// public getWrongCoordinates(): Array<any> {
	// 	return this.wrongCoordinates;
	// }

	// private checkCoordsFromBounds(name: string, lon: Array<number>, lat: Array<number>): boolean {
	// 	let errorTrigger: boolean = false;

	// 	for (let index = 0; index < lon.length; index++) {
	// 		const lonCoord = lon[index];
	// 		if (lonCoord < this.lonBounds.min || lonCoord > this.lonBounds.max) {
	// 			errorTrigger = true;
	// 			break;
	// 		}
	// 	}
	// 	for (let index = 0; index < lat.length; index++) {
	// 		const latCoord = lat[index];
	// 		if (latCoord < this.latBounds.min || latCoord > this.latBounds.max) {
	// 			errorTrigger = true;
	// 			break;
	// 		}
	// 	}

	// 	errorTrigger && this.wrongCoordinates.push(`${name} (${lon[0]},${lat[0]},${lon[1]},${lat[1]})`);

	// 	return !errorTrigger;
	// }

	public readOfflineMapsFile() {
		try {
			this.offlineMaps = [
				{
					'label': 'Keine',
					'file': '',
					'bounds': [],
				},
			];
			this.missingImageFiles = [];
			// this.wrongCoordinates = [];
			const offlineMapsPath = Settings.getValue('map', 'offlinePath');
			const offlineMapsConfigFile = Settings.getValue('map', 'offlineConfigFile');
			const data = fs.readFileSync(path.resolve(__dirname, `${offlineMapsPath}/${offlineMapsConfigFile}`), 'utf8');
			const lines = data.split(/\r?\n/);
			lines.forEach((line: string) => {
				let mapData = line.split(',');
				if (mapData.length > 1) {
					try {
						const file = path.resolve(__dirname, `${offlineMapsPath}/${mapData[1].trim()}`);
						if (
							fs.existsSync(file)
							// &&
							// this.checkCoordsFromBounds(
							// 	mapData[0].trim(),
							// 	[+mapData[2].trim(), +mapData[4].trim()],
							// 	[+mapData[3].trim(), +mapData[5].trim()]
							// )
						) {
							this.offlineMaps.push({
								label: mapData[0].trim(),
								file: file,
								bounds: [
									[+mapData[2].trim(), +mapData[3].trim()],
									[+mapData[4].trim(), +mapData[5].trim()],
								],
							});
						} else {
							this.missingImageFiles.push(mapData[1].trim());
						}
					} catch (error) {
						console.log(error);
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
	}
}
