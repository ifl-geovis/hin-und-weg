import i18n from 'i18next';
// // // const i18nM = require('i18next');
// // // import i18nextBackend from 'i18next-node-fs-backend';
// // import i18nextBackend from 'i18next-fs-backend';
const reactI18nextModule = require('react-i18next').reactI18nextModule;
// // // import i18nextElectronBackend from 'i18next-electron-fs-backend';
// // import {initReactI18next} from 'react-i18next';
// // const reactI18nextModule = require("react-i18next");


import i18nConfig from'./i18nConfig';

// import translationEN from '../../locales/en/translation.json';
// import translationDE from '../../locales/de/translation.json';



const i18nextOptions = {
 
  interpolation: {
    escapeValue: false
  },
  saveMissing: false, //true
  lng: 'de',
  ns: 'translation',
  fallbackLng: i18nConfig.fallbackLng,
  keySeparator: '.',
  whitelist: i18nConfig.languages,
  react: {
    wait: false
  }
};

i18n
.use(reactI18nextModule);
// // .use(i18nextBackend);

// initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .init(i18nextOptions);
    console.log("i18nextOptions CLIENT: " + JSON.stringify(i18nextOptions));
}

export default i18n;