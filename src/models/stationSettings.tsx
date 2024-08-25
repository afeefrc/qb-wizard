import { SETTINGS_STORE_NAME, initDB } from './initDB';
import { settingsSchema } from './schema';
import { removeUncloneableProperties } from './utilFunctions';

// for the settings store
const validateAndSetDefaultsForSettings = (settings) => {
  return Object.entries(settingsSchema).reduce(
    (validatedSettings, [key, field]) => {
      const value = settings[key] === undefined ? field.default : settings[key];
      if (field.validate && !field.validate(value)) {
        throw new Error(`Invalid value for ${key}: ${value}`);
      }
      validatedSettings[key] = value;
      return validatedSettings;
    },
    {},
  );
};

// Operations for station-settings
export async function saveSetting(settings) {
  const validatedSettings = validateAndSetDefaultsForSettings(settings);
  const db = await initDB();
  const tx = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(SETTINGS_STORE_NAME);

  const promises = Object.entries(validatedSettings).map(([key, value]) => {
    return store.get(key).then((existingEntry) => {
      if (existingEntry !== undefined) {
        return store.put({ id: key, value });
      }
      return store.add({ id: key, value });
    });
  });

  await Promise.all(promises);

  await tx.done;
}

export async function getSetting(key) {
  const db = await initDB();
  const tx = db.transaction(SETTINGS_STORE_NAME, 'readonly');
  const store = tx.objectStore(SETTINGS_STORE_NAME);

  const setting = await store.get(key);
  await tx.done;

  if (setting !== undefined) {
    return setting.value;
  }

  // Return default value from schema if setting is not found
  if (settingsSchema[key]) {
    return settingsSchema[key].default;
  }

  return null;
}

export async function getAllSettings() {
  const db = await initDB();
  const tx = db.transaction(SETTINGS_STORE_NAME, 'readonly');
  const store = tx.objectStore(SETTINGS_STORE_NAME);
  const settings = await store.getAll();
  await tx.done;

  const result = settings.reduce((acc, { id, value }) => {
    acc[id] = value;
    return acc;
  }, {});

  // Ensure all settings from the schema are present with default values if not found
  Object.keys(settingsSchema).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(result, key)) {
      result[key] = settingsSchema[key].default;
    }
  });

  return result;
}
