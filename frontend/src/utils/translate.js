import en from '../i18n/locales/en.json';

const lookup = (obj, path) => {
  if (!path) return null;
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
};

export const t = (key, fallback) => {
  const value = lookup(en, key);
  if (value !== null) return value;
  if (fallback !== undefined) return fallback;
  return key;
};

export default t;
