interface I18nConfig {
    languages: string[];
    fallbackLng: string;
    namespace: string
}

const i18nConfig: I18nConfig = {
  languages: ['de', 'en'],
  fallbackLng: 'de',
  namespace: 'translation'
};

export default i18nConfig;