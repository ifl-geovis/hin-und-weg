import * as React from "react";

import Config from "../../config";
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface IProjektInfoProps extends WithNamespaces{
}

// export default 
class ProjektInfo extends React.Component<IProjektInfoProps, {}, {}>
// class ProjektInfo extends React.Component<{}, {}>
{
	

	public render(): JSX.Element
	{
		const {t}:any = this.props ;
		return (
			<div>
				<h3>{t('projectInfo.title')}</h3> <hr/>
				{/* <h3>hin&weg Projektinformationen</h3> <hr/> */}
				<div>
					{t('projectInfo.text1')} <br/><br/>
					{/* hin&weg ist eine Anwendung zur Visualisierung von Umzugsbewegungen. <br/><br/> */}
					{t('projectInfo.text2')}<br/>
					{/* Hersteller der Software ist das Leibniz Institut für Länderkunde (IfL), Leipzig, www.leibniz-ifl.de.<br/> */}
					{t('projectInfo.text3')}<br/>
					{/* Die Software wurde von der DELPHI IMM GmbH in Potsdam entwickelt.<br/> */}
					{t('projectInfo.text4')}<br/><br/><br/><br/>
					{/* Am Projekt am IfL beteiligt waren: Francis Harvey, Tim Leibert, Eric Losang, Aura Moldovan, Maria Turchenko, Nicola Simon, Rowenia Bender (Stand 4.2021)<br/><br/><br/><br/> */}
					<div>
						{t('projectInfo.text5')}<br/><br/>
						{/* Ihr Ansprechpartner für weitere Informationen:<br/><br/> */}
						<strong>{t('projectInfo.text6')}</strong> <br/>
						{/* <strong>Leibniz-Institut für Länderkunde</strong> <br/> */}
						Aura Moldovan, A_Moldovan@leibniz-ifl.de , +49 341 600 55 103<br/>
					</div>
				</div>
			</div>
		);
	}
}
export default withNamespaces()(ProjektInfo);
