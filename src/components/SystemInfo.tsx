import * as React from "react";

export default class SystemInfo extends React.Component<{}, {}>
{

	public render(): JSX.Element
	{
		return (
				<table className="bp3-html-table .bp3-small .bp3-html-table-bordered .bp3-html-table-condensed">
					<tbody>
						<tr>
							<th align="right">hin&weg Version:</th>
							<td>{process.env.npm_package_version}</td>
						</tr>
							<th align="right">Node Version:</th>
							<td>{process.versions.node}</td>
						<tr>
						</tr>
							<th align="right">Chrome Version:</th>
							<td>{process.versions.chrome}</td>
						<tr>
						</tr>
						<tr>
							<th align="right">Electron Version:</th>
							<td>{process.versions.electron}</td>
						</tr>
					</tbody>
				</table>
		)
	}

}