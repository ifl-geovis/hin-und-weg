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
				<div>
					{t('projectInfo.text1')} <br/><br/>
					{t('projectInfo.text2')}<br/>
					{t('projectInfo.text3')}<br/>
					{t('projectInfo.text4')}<br/>
					{t('projectInfo.text5')}<br/><br/>
					<div>
						<strong>{t('projectInfo.text7')}</strong><br/><br/>
						{t('projectInfo.text8')}<br/><br/>
						{t('projectInfo.text9')}<br/><br/>
						{t('projectInfo.text10')}<br/><br/>
					</div><br/><br/><br/>
					<div>
						{t('projectInfo.text6')}<br/>
						kontakt@hin-und-weg.online<br/>
					</div>
				</div>
			</div>
		);
	}
}
export default withNamespaces()(ProjektInfo);
