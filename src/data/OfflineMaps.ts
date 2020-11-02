const fs = require('fs');
const path = require('path');
import Settings from '../settings';

export interface IOfflineMaps {
	label: string;
	file: string;
	bounds: Array<Array<number>>;
}

export default class OfflineMaps {
	private static current: OfflineMaps = new OfflineMaps();

	private missingOfflineTxt: boolean = false;

	private offlineMaps: Array<IOfflineMaps> = [
		{
			'label': 'Keine',
			'file': '',
			'bounds': [],
		},
	];

	public static getCurrentOfflineMaps(): OfflineMaps {
		return OfflineMaps.current;
	}

	// public setData(data: Array<IOfflineMaps>) {
	// 	this.offlineMaps = data;
	// }

	public getData(): Array<IOfflineMaps> {
		return this.offlineMaps;
	}

	public setMissingOfflineTxt(value: boolean) {
		this.missingOfflineTxt = value;
	}

	public getMissingOfflineTxt(): boolean {
		return this.missingOfflineTxt;
	}

	public readOfflineMapsFile() {
		try {
			this.offlineMaps = [
				{
					'label': 'Keine',
					'file': '',
					'bounds': [],
				},
			];
			const offlineMapsPath = Settings.getValue('map', 'offlinePath');
			const data = fs.readFileSync(path.resolve(__dirname, `${offlineMapsPath}/offlineMaps.txt`), 'utf8');
			const lines = data.split(/\r?\n/);
			lines.forEach((line: any) => {
				let mapData = line.split(',');
				if (mapData.length > 1) {
					this.offlineMaps.push({
						label: mapData[0].trim(),
						file: path.resolve(__dirname, `${offlineMapsPath}/${mapData[1].trim()}`),
						bounds: [
							[+mapData[2].trim(), +mapData[3].trim()],
							[+mapData[4].trim(), +mapData[5].trim()],
						],
					});
				}
			});
			this.setMissingOfflineTxt(false);
		} catch (error) {
			console.log(error);
			this.setMissingOfflineTxt(true);
		}
	}
}
