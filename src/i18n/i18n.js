import { I18n } from 'i18n-js';
import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';

// Initialize i18n
const i18n = new I18n({
    en,
    hi,
    gu,
});

// Set the default locale to Gujarati
const defaultLocale = 'gu';

// Set the locale once at the beginning of your app
i18n.locale = defaultLocale;

// When a value is missing from a language it'll fallback to another language with the key present
i18n.enableFallback = true;

// Set default separator for nested translations
i18n.defaultSeparator = '.';

export const changeLanguage = (languageKey) => {
    i18n.locale = languageKey;
};

export const getCurrentLanguage = () => i18n.locale;

export default i18n;
