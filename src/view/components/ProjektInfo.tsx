import * as React from "react";

import Config from "../../config";

export default class ProjektInfo extends React.Component<{}, {}>
{

	public render(): JSX.Element
	{
		return (
			<div>
				<h3>hin&weg Projektinformationen</h3> <hr/>
				<div>
					hin&weg ist eine Anwendung zur Visualisierung von Umzugsbewegungen. <br/><br/>
					Hersteller der Software ist das Leibniz Institut für Länderkunde (IfL), Leipzig, www.leibniz-ifl.de.<br/>
					Die Software wurde von der DELPHI IMM GmbH in Potsdam entwickelt.<br/>
					Am Projekt am IfL beteiligt waren: Francis Harvey, Tim Leibert, Eric Losang, Aura Moldovan, Maria Turchenko, Nicola Simon, Rowenia Bender (Stand 4.2021)<br/><br/><br/><br/>
					<div>
						Ihr Ansprechpartner für weitere Informationen:<br/><br/>
						<strong>Leibniz-Institut für Länderkunde</strong> <br/>
						Aura Moldovan, A_Moldovan@leibniz-ifl.de , +49 341 600 55 103<br/>
					</div>
				</div>
			</div>
		);
	}
}