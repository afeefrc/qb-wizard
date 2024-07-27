// src/utils/db.js
import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'my-database';
const DB_VERSION = 1;
const STORE_NAME = 'question-bank';

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

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
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

const removeUncloneableProperties = (item) => {
  const cloneableItem = {};
  Object.entries(item).forEach(([key, value]) => {
    if (typeof value !== 'function') {
      cloneableItem[key] = value;
    }
  });
  return cloneableItem;
};

export const addQuestion = async (item) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const validatedItem = validateAndSetDefaults(item);
  const cloneableItem = removeUncloneableProperties(validatedItem);
  await store.add(cloneableItem);
  await tx.done;
};

export const getQuestions = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return store.getAll();
};

export const deleteQuestion = async (id) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
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
