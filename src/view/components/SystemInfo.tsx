import * as React from "react";

import Config from "../../config";

export default class SystemInfo extends React.Component<{}, {}>
{

	public render(): JSX.Element
	{
		return (
			<div>
				<table className="bp3-html-table .bp3-small .bp3-html-table-bordered .bp3-html-table-condensed">
					<tbody>
						<tr>
							<th align="right">hin&weg Version:</th>
							<td>{process.env.npm_package_version}</td>
						</tr>
						<tr>
							<th align="right">NodeJS Version:</th>
							<td>{process.versions.node}</td>
						</tr>
						<tr>
							<th align="right">Chrome Version:</th>
							<td>{process.versions.chrome}</td>
						</tr>
						<tr>
							<th align="right">Electron Version:</th>
							<td>{process.versions.electron}</td>
						</tr>
						<tr>
							<th align="right">Konfigurationsprofil:</th>
							<td>{Config.getProfile()}</td>
						</tr>
					</tbody>
				</table>
				<table className="bp3-html-table .bp3-small .bp3-html-table-bordered .bp3-html-table-condensed">
					<tbody>
						<tr>
							<th align="right">Prozess-Typ:</th>
							<td>{process.type}</td>
						</tr>
						<tr>
							<th align="right">Fenster-ID:</th>
							<td>{require('electron').remote.getCurrentWindow().id}</td>
						</tr>
					</tbody>
				</table>
			</div>
		)
	}

}