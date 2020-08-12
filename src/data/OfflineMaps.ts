const fs = require('fs');

export interface IOfflineMaps {
	label: string;
	file: string;
	bounds: Array<Array<number>>;
}

export default class OfflineMaps {
	private static current: OfflineMaps = new OfflineMaps();

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

	public readOfflineMapsFile() {
		try {
			const data = fs.readFileSync(`offline/offlineMaps.txt`, 'utf8');
			const lines = data.split(/\r?\n/);
			lines.forEach((line: any) => {
				let mapData = line.split(',');
				if (mapData.length > 1) {
					this.offlineMaps.push({
						label: mapData[0].trim(),
						file: `offline/${mapData[1].trim()}`,
						bounds: [
							[+mapData[2].trim(), +mapData[3].trim()],
							[+mapData[4].trim(), +mapData[5].trim()],
						],
					});
				}
			});
		} catch (error) {
			console.log(error);
		}
	}
}
