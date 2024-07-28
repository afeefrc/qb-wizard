// src/utils/db.js
import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'my-database';
const DB_VERSION = 1;
const QUESTION_STORE_NAME = 'question-bank';
const SETTINGS_STORE_NAME = 'app-settings';

const schema = {
  id: { type: 'string', default: () => uuidv4() },
  unitName: {
    type: 'enum',
    values: ['ADC', 'APP', 'APP(S)', 'ACC', 'ACC(S)', 'OCC'],
    default: 'ADC',
  },
  marks: {
    type: 'number',
    default: 1,
    validate: (value) => Number.isInteger(value) && value > 0,
  },
  questionType: { type: 'string', default: '' },
  questionText: { type: 'string', default: '' },
  trueAnswer: { type: 'boolean', default: true },
  answerText: { type: 'string', default: '' },
  keyValuePairs: { type: 'object', default: {} },
  image: { type: 'blob', default: null },
  linkedQuestion: { type: 'array', default: [] },
  mandatory: { type: 'boolean', default: false },
  difficultyLevel: {
    type: 'enum',
    values: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  moduleNumber: {
    type: 'number',
    default: 1,
    validate: (value) => [0, 1, 2, 3, 4, 5].includes(value),
  },
  comments: { type: 'string', default: '' },
  isReviewed: { type: 'boolean', default: false },
};

const settingsSchema = {
  theme: { type: 'string', default: 'light' },
  notificationsEnabled: { type: 'boolean', default: true },
  stationName: {
    type: 'object',
    properties: {
      code: { type: 'string', default: '' },
      name: { type: 'string', default: '' },
      city: { type: 'string', default: '' },
    },
    default: {
      code: '',
      name: '',
      city: '',
    },
  },
  unitsApplicable: { type: 'array', default: [] },
};

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

const validateAndSetDefaults = (item) => {
  return Object.entries(schema).reduce((validatedItem, [key, field]) => {
    const value = item[key] === undefined ? field.default : item[key];
    if (field.validate && !field.validate(value)) {
      throw new Error(`Invalid value for ${key}: ${value}`);
    }
    validatedItem[key] = value;
    return validatedItem;
  }, {});
};

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

// Operations for app-settings
export async function saveSetting(settings) {
  const validatedSettings = validateAndSetDefaultsForSettings(settings);
  const db = await initDB();
  const tx = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(SETTINGS_STORE_NAME);

  const promises = Object.entries(validatedSettings).map(([key, value]) => {
    if (key === 'stationName' && typeof value === 'object') {
      // Handle nested properties for stationName
      const nestedPromises = Object.entries(value).map(([subKey, subValue]) => {
        const nestedKey = `${key}.${subKey}`;
        return store.get(nestedKey).then((existingEntry) => {
          if (existingEntry !== undefined) {
            return store.put({ id: nestedKey, value: subValue });
          }
          return store.add({ id: nestedKey, value: subValue });
        });
      });
      return Promise.all(nestedPromises);
    }
    return store.get(key).then((existingEntry) => {
      if (existingEntry !== undefined) {
        return store.put({ id: key, value });
      }
      return store.add({ id: key, value });
    });
  });

  await Promise.all(promises.flat());

  await tx.done;
}

export async function getSetting(key) {
  const db = await initDB();
  const tx = db.transaction(SETTINGS_STORE_NAME, 'readonly');
  const store = tx.objectStore(SETTINGS_STORE_NAME);

  if (key === 'stationName') {
    const code = await store.get('stationName.code');
    const name = await store.get('stationName.name');
    const city = await store.get('stationName.city');
    await tx.done;
    return {
      code: code ? code.value : '',
      name: name ? name.value : '',
      city: city ? city.value : '',
    };
  }
  const setting = await store.get(key);
  await tx.done;
  return setting ? setting.value : null;
}

export async function getAllSettings() {
  const db = await initDB();
  const tx = db.transaction(SETTINGS_STORE_NAME, 'readonly');
  const store = tx.objectStore(SETTINGS_STORE_NAME);
  const settings = await store.getAll();
  await tx.done;

  const result = settings.reduce((acc, { id, value }) => {
    const [mainKey, subKey] = id.split('.');
    if (subKey) {
      if (!acc[mainKey]) {
        acc[mainKey] = {};
      }
      acc[mainKey][subKey] = value;
    } else {
      acc[id] = value;
    }
    return acc;
  }, {});

  return result;
}
