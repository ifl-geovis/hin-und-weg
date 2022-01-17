import i18n from 'i18next';
import i18nextBackend from 'i18next-node-fs-backend';
import i18nConfig from'./i18nConfig';
import { platform } from 'process';

// import translationDE from './locales/de/translation.json';
const isDev = require('electron-is-dev');
const isMac = platform === "darwin";
const path = isMac && !isDev ? process.resourcesPath + '/app/locales/{{lng}}/{{ns}}.json' : './locales/{{lng}}/{{ns}}.json';


const i18nextOptions = {
  backend:{
    // path where resources get loaded from
    loadPath: path,
    // loadPath:  './locales/{{lng}}/{{ns}}.json',
   

    // path to post missing resources
    addPath: path,
    // addPath: './locales/{{lng}}/{{ns}}.missing.json',

    // jsonIndent to use when storing json files
    jsonIndent: 2,
  },
  interpolation: {
    escapeValue: false
  },
//   saveMissing: false, //true
  fallbackLng: i18nConfig.fallbackLng,
  keySeparator: '.',
  whitelist: i18nConfig.languages,
  react: {
    wait: false
  }
};

i18n
.use(i18nextBackend)
    // console.log("i18nextBackend: " + JSON.stringify(i18nextBackend));

// // .use(i18nextBackend);
// .use(reactI18nextModule);


// initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .init(i18nextOptions);
    console.log("i18nextOptions: " + JSON.stringify(i18nextOptions));

}

export default i18n;