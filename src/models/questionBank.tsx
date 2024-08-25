// import { openDB } from 'idb';
// import { v4 as uuidv4 } from 'uuid';
import {
  questionsSchema,
  // settingsSchema,
  // examinerListSchema,
  // reviewPanelSchema,
  // validateAndSetDefaultsForReviewPanel,
  // validateAndSetDefaultsForExaminerAssignment,
} from './schema';

import { QUESTION_STORE_NAME, initDB } from './initDB';
import { removeUncloneableProperties } from './utilFunctions';

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
