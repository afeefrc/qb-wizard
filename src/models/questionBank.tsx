import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';
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
  LINKED_QUESTIONS_STORE,
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

// // Add a pending change to the question-bank
// export const addPendingChange = async (change) => {
//   const db = await initDB();
//   const tx = db.transaction(PENDING_CHANGES_STORE_NAME, 'readwrite');
//   const store = tx.objectStore(PENDING_CHANGES_STORE_NAME);
//   await store.add(change);
//   await tx.done;
// };

// add new question to the pending changes
export const addPendingChange = async (item) => {
  // if the item has id, it is an update, otherwise it is an add
  const { type, data } = item;
  // const dataToPass = type === 'delete' ? item.data : dataWithoutId;
  const validatedItem = validateAndSetDefaults(data);
  const cloneableItem = removeUncloneableProperties(validatedItem);
  // await addPendingChange({ type: 'add', data: cloneableItem });
  const db = await initDB();
  const tx = db.transaction(PENDING_CHANGES_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PENDING_CHANGES_STORE_NAME);
  // if the item has id, it is an update (we need new id and item to preserve old), otherwise it is an add
  await store.add({ type, data: cloneableItem });
  // if (type === 'update') {
  //   await store.add({ type: 'update', data: cloneableItem });
  // } else if (type === 'delete') {
  //   await store.add({ type: 'delete', data: cloneableItem });
  // } else {
  //   await store.add({ type: 'add', data: cloneableItem });
  // }
  await tx.done;
};

// TODO: add a function to update a question in the question-bank

// set isdelete true a question from the question-bank item and add to pending changes
export const deleteQuestion = async (deleteId, updatedChange) => {
  const db = await initDB();
  const tx = db.transaction(PENDING_CHANGES_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PENDING_CHANGES_STORE_NAME);

  // Check if there's an existing pending change for this question
  const existingChange = await store.get(deleteId);

  if (existingChange) {
    // If there's an existing change, update it
    const mergedChange = {
      ...existingChange,
      ...updatedChange,
      data: { ...existingChange, ...updatedChange, isDeleted: true },
      updatedAt: new Date().toISOString(),
    };
    await store.put(mergedChange);
  } else {
    // If there's no existing change, add a new one
    const newChange = {
      ...updatedChange,
      data: { ...updatedChange.data, id: deleteId, isDeleted: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await store.add(newChange);
  }

  await tx.done;
};

export const getQuestions = async () => {
  const db = await initDB();
  const tx = db.transaction(QUESTION_STORE_NAME, 'readonly');
  const store = tx.objectStore(QUESTION_STORE_NAME);
  return store.getAll();
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
// TODO: check the correctness of the function
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

  if (change.type === 'add' || change.type === 'update') {
    let updatedData = { ...change.data, updatedAt };

    if (change.type === 'add' || updatedData.serialNumber === undefined) {
      const serialNumber = await getNextSerialNumberInTransaction(
        questionStore,
        change.data.unitName,
        year,
      );
      updatedData = { ...updatedData, year, serialNumber };
    }

    await handleRequest(questionStore.put(updatedData));
    console.log('Question added/updated:', updatedData);
  } else if (change.type === 'delete') {
    const question = await questionStore.get(change.data.id);
    if (question) {
      await questionStore.put({ ...question, isDeleted: true, updatedAt });
    }
  }

  await pendingStore.delete(changeId);
  await tx.done;
};

// Helper function to handle IDBRequest or Promise
const handleRequest = (request) => {
  if (request instanceof IDBRequest) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IDBRequest succeeded:', request.result);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('IDBRequest failed:', request.error);
        reject(request.error);
      };
    });
  }
  if (request instanceof Promise) {
    return request
      .then((result) => {
        console.log('Promise resolved:', result);
        return result;
      })
      .catch((error) => {
        console.error('Promise rejected:', error);
        throw error;
      });
  }
  console.error('Unexpected request type:', request);
  return Promise.reject(new Error('Unexpected request type'));
};

// Helper function to get the next serial number within the current transaction
const getNextSerialNumberInTransaction = async (
  store,
  unitName,
  year,
  lastAssignedSerialNumber,
) => {
  try {
    const index = store.index('unitNameYearIndex');
    console.log(`Getting next serial number for ${unitName}, ${year}`);

    if (lastAssignedSerialNumber) {
      console.log(
        `Using last assigned serial number: ${lastAssignedSerialNumber + 1}`,
      );
      return lastAssignedSerialNumber + 1;
    }

    // Get all questions for the given unit and year
    const questions = await handleRequest(
      index.getAll(IDBKeyRange.only([unitName, year])),
    );

    if (questions.length > 0) {
      // Find the maximum serial number
      const maxSerialNumber = Math.max(...questions.map((q) => q.serialNumber));
      const nextSerialNumber = maxSerialNumber + 1;
      console.log(`Next serial number: ${nextSerialNumber}`);
      return nextSerialNumber;
    } else {
      console.log('No existing entries, starting with serial number 1');
      return 1;
    }
  } catch (error) {
    console.error('Error in getNextSerialNumberInTransaction:', error);
    throw error;
  }
};

// Apply all pending changes to the question-bank
export const applyAllPendingChanges = async () => {
  try {
    const db = await initDB();
    console.log('Database initialized');

    const tx = db.transaction(
      [PENDING_CHANGES_STORE_NAME, QUESTION_STORE_NAME, LINKED_QUESTIONS_STORE],
      'readwrite',
    );
    console.log('Transaction started');

    const pendingStore = tx.objectStore(PENDING_CHANGES_STORE_NAME);
    const questionStore = tx.objectStore(QUESTION_STORE_NAME);
    const linkedQuestionsStore = tx.objectStore(LINKED_QUESTIONS_STORE);

    const changes = await handleRequest(pendingStore.getAll());
    console.log('Pending changes retrieved:', changes.length);
    const year = new Date().getFullYear();

    let lastAssignedSerialNumber = 0;

    changes.forEach(async (change) => {
      console.log('Processing change:', change);
      const updatedAt = new Date().toISOString();

      if (change.type === 'add') {
        let updatedData = { ...change.data, updatedAt };

        const serialNumber = await getNextSerialNumberInTransaction(
          questionStore,
          change.data.unitName,
          year,
        );
        updatedData = { ...updatedData, year, serialNumber };

        await handleRequest(questionStore.put(updatedData));
        console.log('Question added:', updatedData);
      } else if (change.data.isDeleted === false && change.type === 'update') {
        const existingQuestion = await handleRequest(
          questionStore.get(change.data.id),
        );
        if (existingQuestion) {
          // Preserve the old instance
          const oldInstance = {
            ...existingQuestion,
            isLatestVersion: false,
            archivedAt: new Date().toISOString(),
          };
          await handleRequest(questionStore.put(oldInstance));
          console.log('Old instance archived:', oldInstance.id);

          // Create a new item with updated data and new serial number
          let updatedData = {
            ...existingQuestion, // Start with existing data
            ...change.data, // Override with new data
            updatedAt,
            previousVersionId: existingQuestion.id, // Reference to the old version
            isLatestVersion: true,
            id: uuidv4(),
          };
          const serialNumber = await getNextSerialNumberInTransaction(
            questionStore,
            updatedData.unitName,
            year,
          );
          updatedData = {
            ...updatedData,
            year,
            serialNumber,
          };

          await handleRequest(questionStore.put(updatedData));
          console.log('New updated question added:', updatedData);
        } else {
          console.warn(
            `Question with id ${change.data.id} not found for update`,
          );
        }
      } else if (change.data.isDeleted === true || change.type === 'delete') {
        const question = await handleRequest(questionStore.get(change.data.id));
        if (question) {
          await handleRequest(
            questionStore.put({ ...question, isDeleted: true, updatedAt }),
          );
          console.log('Question marked as deleted:', change.data.id);
        }
      }
      await handleRequest(pendingStore.delete(change.id));
      console.log('Pending change deleted:', change.id);
    });

    // Apply linked questions
    const linkedQuestions = await handleRequest(linkedQuestionsStore.getAll());
    console.log('Linked questions retrieved:', linkedQuestions.length);

    const linkMap = new Map();

    // First pass: collect all links
    linkedQuestions.forEach(({ questionId, linkedQuestionIds }) => {
      // Set main links (replacing existing, including empty arrays)
      linkMap.set(questionId, new Set(linkedQuestionIds));

      // Add reverse links (additive), but only if linkedQuestionIds is not empty
      if (linkedQuestionIds.length > 0) {
        linkedQuestionIds.forEach((linkedId) => {
          if (linkedId !== questionId) {
            if (!linkMap.has(linkedId)) {
              linkMap.set(linkedId, new Set());
            }
            linkMap.get(linkedId).add(questionId);
          }
        });
      }
    });

    // Update questions with their links
    await Promise.all(
      Array.from(linkMap).map(async ([questionId, linkedIds]) => {
        const question = await handleRequest(questionStore.get(questionId));
        if (question) {
          // For main links, directly set the new links (including empty arrays)
          if (linkedQuestions.some((lq) => lq.questionId === questionId)) {
            question.linkedQuestion = Array.from(linkedIds);
          } else {
            // For reverse links, merge with existing links
            const existingLinks = new Set(question.linkedQuestion || []);
            const updatedLinks = new Set([...existingLinks, ...linkedIds]);
            question.linkedQuestion = Array.from(updatedLinks);
          }
          await handleRequest(questionStore.put(question));
          console.log(`Updated links for question ${questionId}`);
        }
      }),
    );

    // Clear the linked questions store
    await handleRequest(linkedQuestionsStore.clear());

    await tx.done;
    console.log('Transaction completed');
  } catch (error) {
    console.error('Error in applyAllPendingChanges:', error);
    throw error;
  }
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

// Link questions
export const addLinkedQuestions = async (questionId, linkedQuestionIds) => {
  const db = await initDB();
  const tx = db.transaction(LINKED_QUESTIONS_STORE, 'readwrite');
  const store = tx.objectStore(LINKED_QUESTIONS_STORE);
  await store.add({ questionId, linkedQuestionIds });
  await tx.done;
};

export const getLinkedQuestions = async () => {
  const db = await initDB();
  const tx = db.transaction(LINKED_QUESTIONS_STORE, 'readonly');
  const store = tx.objectStore(LINKED_QUESTIONS_STORE);
  return store.getAll();
};

export const deleteLinkedQuestions = async (questionId) => {
  const db = await initDB();
  const tx = db.transaction(LINKED_QUESTIONS_STORE, 'readwrite');
  const store = tx.objectStore(LINKED_QUESTIONS_STORE);
  await store.delete(questionId);
  await tx.done;
};

export const updateLinkedQuestions = async (
  id: number,
  {
    questionId,
    linkedQuestionIds,
  }: { questionId: string; linkedQuestionIds: string[] },
) => {
  const db = await initDB();
  const tx = db.transaction(LINKED_QUESTIONS_STORE, 'readwrite');
  const store = tx.objectStore(LINKED_QUESTIONS_STORE);
  await store.put({ id, questionId, linkedQuestionIds });
  await tx.done;
};
