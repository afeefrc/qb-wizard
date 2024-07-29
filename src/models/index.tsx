// src/utils/db.js
import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { questionsSchema, settingsSchema } from './schema';

const DB_NAME = 'my-database';
const DB_VERSION = 1;
const QUESTION_STORE_NAME = 'question-bank';
const SETTINGS_STORE_NAME = 'app-settings';


export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(QUESTION_STORE_NAME)) {
        db.createObjectStore(QUESTION_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        db.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

// for the question-bank store
const validateAndSetDefaults = (item) => {
  return Object.entries(questionsSchema).reduce(
    (validatedItem, [key, field]) => {
      const value = item[key] === undefined ? field.default : item[key];
      if (field.validate && !field.validate(value)) {
        throw new Error(`Invalid value for ${key}: ${value}`);
      }
      validatedItem[key] = value;
      return validatedItem;
    },
    {},
  );
};

//for the settings store
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

const removeUncloneableProperties = (item) => {
  const cloneableItem = {};
  Object.entries(item).forEach(([key, value]) => {
    if (typeof value !== 'function') {
      cloneableItem[key] = value;
    }
  });
  return cloneableItem;
};

// Operations for question-Bank

export const addQuestion = async (item) => {
  const db = await initDB();
  const tx = db.transaction(QUESTION_STORE_NAME, 'readwrite');
  const store = tx.objectStore(QUESTION_STORE_NAME);
  const validatedItem = validateAndSetDefaults(item);
  const cloneableItem = removeUncloneableProperties(validatedItem);
  await store.add(cloneableItem);
  await tx.done;
};

export const getQuestions = async () => {
  const db = await initDB();
  const tx = db.transaction(QUESTION_STORE_NAME, 'readonly');
  const store = tx.objectStore(QUESTION_STORE_NAME);
  return store.getAll();
};

export const deleteQuestion = async (id) => {
  const db = await initDB();
  const tx = db.transaction(QUESTION_STORE_NAME, 'readwrite');
  const store = tx.objectStore(QUESTION_STORE_NAME);
  await store.delete(id);
  await tx.done;
};

// Function to handle image upload and convert it to a Blob
export const handleImageUpload = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const blob = new Blob([reader.result], { type: file.type });
      resolve(blob);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

//Operations for app-settings

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


