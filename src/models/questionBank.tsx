import { openDB } from 'idb';
import {
  questionsSchema,
  // settingsSchema,
  // examinerListSchema,
  // reviewPanelSchema,
  // validateAndSetDefaultsForReviewPanel,
  // validateAndSetDefaultsForExaminerAssignment,
} from './schema';

import {
  QUESTION_STORE_NAME,
  PENDING_CHANGES_STORE_NAME,
  initDB,
} from './initDB';
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

// get the next serial number for a question
async function getNextSerialNumber(db, unitName, year) {
  const tx = db.transaction(QUESTION_STORE_NAME, 'readonly');
  const store = tx.objectStore(QUESTION_STORE_NAME);
  const index = store.index('unitNameYearIndex');

  const cursor = await index.openCursor(
    IDBKeyRange.only([unitName, year]),
    'prev',
  );

  if (cursor) {
    return cursor.value.serialNumber + 1;
  } else {
    return 1;
  }
}

// Add a pending change to the question-bank
export const addPendingChange = async (change) => {
  const db = await initDB();
  const tx = db.transaction(PENDING_CHANGES_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PENDING_CHANGES_STORE_NAME);
  await store.add(change);
  await tx.done;
};

// Update a pending change in the pending-changes store
export const updatePendingChange = async (changeId, updatedChange) => {
  const db = await initDB();
  const tx = db.transaction(PENDING_CHANGES_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PENDING_CHANGES_STORE_NAME);

  // First, check if the change exists
  const existingChange = await store.get(changeId);
  if (!existingChange) {
    throw new Error(`Pending change with id ${changeId} not found`);
  }

  // Merge the existing change with the updated change
  const mergedChange = {
    ...existingChange,
    ...updatedChange,
    updatedAt: new Date().toISOString(),
  };

  // Update the change in the store
  await store.put(mergedChange);
  await tx.done;

  return mergedChange;
};

// Delete a pending change from the pending-changes store
export const deletePendingChange = async (changeId) => {
  const db = await initDB();
  const tx = db.transaction(PENDING_CHANGES_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PENDING_CHANGES_STORE_NAME);

  // Check if the change exists
  const existingChange = await store.get(changeId);
  if (!existingChange) {
    throw new Error(`Pending change with id ${changeId} not found`);
  }

  // Delete the change from the store
  await store.delete(changeId);
  await tx.done;

  return true; // Indicate successful deletion
};

// get all pending changes from the question-bank
export const getPendingChanges = async () => {
  const db = await initDB();
  const tx = db.transaction(PENDING_CHANGES_STORE_NAME, 'readonly');
  const store = tx.objectStore(PENDING_CHANGES_STORE_NAME);
  return store.getAll();
};

// Apply a pending change to the question-bank
export const applyPendingChange = async (changeId) => {
  const db = await initDB();
  const tx = db.transaction(
    [PENDING_CHANGES_STORE_NAME, QUESTION_STORE_NAME],
    'readwrite',
  );
  const pendingStore = tx.objectStore(PENDING_CHANGES_STORE_NAME);
  const questionStore = tx.objectStore(QUESTION_STORE_NAME);

  const change = await pendingStore.get(changeId);
  const updatedAt = new Date().toISOString();

  if (change.type === 'update') {
    await questionStore.put({ ...change.data, updatedAt });
  } else if (change.type === 'delete') {
    const question = await questionStore.get(change.data.id);
    if (question) {
      await questionStore.put({ ...question, isDelete: true, updatedAt });
    }
  }

  await pendingStore.delete(changeId);
  await tx.done;
};

// Apply all pending changes to the question-bank
export const applyAllPendingChanges = async () => {
  const db = await initDB();
  const tx = db.transaction(
    [PENDING_CHANGES_STORE_NAME, QUESTION_STORE_NAME],
    'readwrite',
  );
  const pendingStore = tx.objectStore(PENDING_CHANGES_STORE_NAME);
  const questionStore = tx.objectStore(QUESTION_STORE_NAME);

  const changes = await pendingStore.getAll();

  await Promise.all(
    changes.map(async (change) => {
      const updatedAt = new Date().toISOString();
      const year = new Date().getFullYear();

      if (change.type === 'add' || change.type === 'update') {
        const serialNumber = await getNextSerialNumber(
          db,
          change.data.unitName,
          year,
        );
        const updatedData = {
          ...change.data,
          year,
          serialNumber,
          updatedAt,
        };
        await questionStore.put(updatedData);
      } else if (change.type === 'delete') {
        const question = await questionStore.get(change.data.id);
        if (question) {
          await questionStore.put({ ...question, isDelete: true, updatedAt });
        }
      }
      await pendingStore.delete(change.id);
    }),
  );

  await tx.done;
};

// add question to the pending changes
export const addQuestion = async (item) => {
  const validatedItem = validateAndSetDefaults(item);
  const cloneableItem = removeUncloneableProperties(validatedItem);
  await addPendingChange({ type: 'add', data: cloneableItem });
};

// set isdelete true a question from the question-bank
export const deleteQuestion = async (id) => {
  await addPendingChange({ type: 'delete', data: { id } });
};

// add a question to the question-bank
// export const addQuestion = async (item) => {
//   const db = await initDB();
//   const tx = db.transaction(QUESTION_STORE_NAME, 'readwrite');
//   const store = tx.objectStore(QUESTION_STORE_NAME);

//   const year = new Date().getFullYear();
//   const serialNumber = await getNextSerialNumber(db, item.unitName, year);

//   const validatedItem = validateAndSetDefaults({
//     ...item,
//     year,
//     serialNumber,
//   });

//   const cloneableItem = removeUncloneableProperties(validatedItem);
//   await store.add(cloneableItem);
//   await tx.done;
// };

export const getQuestions = async () => {
  const db = await initDB();
  const tx = db.transaction(QUESTION_STORE_NAME, 'readonly');
  const store = tx.objectStore(QUESTION_STORE_NAME);
  return store.getAll();
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
