import * as React from "react";

import Config from "../config";

export default class ProjektInfo extends React.Component<{}, {}>
{

	public render(): JSX.Element
	{
		return (
			<div>
				<h3>hin&weg Projektinformationen</h3> <hr/>
				<div>
					hin&weg ist eine Anwendung zur Visualisierung von Umzugsbewegungen. <br/>
					In Auftrag gegeben wurde das Projekt vom Institut für Länderkunde und entwickelt durch die DELPHI IMM ansässig in Potsdam.<br/><br/><br/><br/>
					<div>
						Ihre Ansprechpartner für weitere Informationen:<br/><br/>
						<strong>Leibniz-Institut für Länderkunde</strong> <br/>
						Aura Moldovan, A_Moldovan@leibniz-ifl.de , +49 341 600 55 103<br/>
					</div>
				</div>
			</div>
		);
	}
}