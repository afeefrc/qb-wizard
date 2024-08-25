// src/utils/db.js
// import { openDB } from 'idb';
// import { v4 as uuidv4 } from 'uuid';
// import {
//   questionsSchema,
//   settingsSchema,
//   examinerListSchema,
//   reviewPanelSchema,
//   examinerAssignmentSchema,
// } from './schema';

// import { removeUncloneableProperties } from './utilFunctions';

// import {
//   DB_NAME,
//   DB_VERSION,
//   QUESTION_STORE_NAME,
//   SETTINGS_STORE_NAME,
//   EXAMINER_STORE_NAME,
//   REVIEW_PANEL_STORE,
//   EXAMINER_ASSIGNMENT_STORE,
//   initDB,
// } from './initDB';

export {
  addQuestion,
  getQuestions,
  deleteQuestion,
  handleImageUpload,
} from './questionBank';

export { saveSetting, getSetting, getAllSettings } from './stationSettings';
export {
  addExaminer,
  getExaminer,
  getAllExaminers,
  deleteExaminer,
  updateExaminer,
} from './examiners';

export {
  addReviewPanel,
  getAllReviewPanels,
  deleteReviewPanel,
  updateReviewPanel,
} from './reviewPanel';

export {
  addExaminerAssignment,
  getAllExaminerAssignments,
  deleteExaminerAssignment,
  updateExaminerAssignment,
} from './examinerAssignment';

export {
  addSyllabusSection,
  getSyllabusSection,
  getAllSyllabusSections,
  deleteSyllabusSection,
  updateSyllabusSection,
} from './syllabusSections';

// const DB_NAME = 'my-database';
// const DB_VERSION = 1;
// const QUESTION_STORE_NAME = 'question-bank';
// const SETTINGS_STORE_NAME = 'app-settings';
// const EXAMINER_STORE_NAME = 'examiner-list';
// const REVIEW_PANEL_STORE = 'review-panel';
// const EXAMINER_ASSIGNMENT_STORE = 'examiner-assignment';

// type ExaminerItem = {
//   [key: string]: any;
// };

// export const initDB = async () => {
//   return openDB(DB_NAME, DB_VERSION, {
//     upgrade(db) {
//       if (!db.objectStoreNames.contains(QUESTION_STORE_NAME)) {
//         db.createObjectStore(QUESTION_STORE_NAME, {
//           keyPath: 'id',
//           autoIncrement: true,
//         });
//       }
//       if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
//         db.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'id' });
//       }
//       // Create examiner-list if it doesn't exist
//       if (!db.objectStoreNames.contains(EXAMINER_STORE_NAME)) {
//         const examinerStore = db.createObjectStore(EXAMINER_STORE_NAME, {
//           keyPath: 'id',
//           autoIncrement: true,
//         });
//         // Create an index on examinerEmpId with unique constraint
//         examinerStore.createIndex('examinerEmpId', 'examinerEmpId', {
//           unique: true,
//         });
//       }
//       if (!db.objectStoreNames.contains(REVIEW_PANEL_STORE)) {
//         db.createObjectStore(REVIEW_PANEL_STORE, {
//           keyPath: 'id',
//           autoIncrement: true,
//         });
//       }
//       if (!db.objectStoreNames.contains(EXAMINER_ASSIGNMENT_STORE)) {
//         db.createObjectStore(EXAMINER_ASSIGNMENT_STORE, {
//           keyPath: 'id',
//           autoIncrement: true,
//         });
//       }
//     },
//   });
// };

// for the question-bank store
// const validateAndSetDefaults = (item) => {
//   return Object.entries(questionsSchema).reduce(
//     (validatedItem, [key, field]) => {
//       const value = item[key] === undefined ? field.default : item[key];
//       if (field.validate && !field.validate(value)) {
//         throw new Error(`Invalid value for ${key}: ${value}`);
//       }
//       validatedItem[key] = value;
//       return validatedItem;
//     },
//     {},
//   );
// };

// for the settings store
// const validateAndSetDefaultsForSettings = (settings) => {
//   return Object.entries(settingsSchema).reduce(
//     (validatedSettings, [key, field]) => {
//       const value = settings[key] === undefined ? field.default : settings[key];
//       if (field.validate && !field.validate(value)) {
//         throw new Error(`Invalid value for ${key}: ${value}`);
//       }
//       validatedSettings[key] = value;
//       return validatedSettings;
//     },
//     {},
//   );
// };

/// Function to validate and set defaults for examiner items
// const validateAndSetDefaultsForExaminer = (
//   item: ExaminerItem,
// ): ExaminerItem => {
//   try {
//     const validatedItem = { ...item };

//     Object.keys(examinerListSchema).forEach((key) => {
//       const schema = examinerListSchema[key];
//       if (validatedItem[key] === undefined) {
//         validatedItem[key] =
//           typeof schema.default === 'function'
//             ? schema.default()
//             : schema.default;
//       } else if (key === 'examinerUnits' && Array.isArray(validatedItem[key])) {
//         validatedItem[key] = validatedItem[key].map((unitItem) => {
//           const validatedUnitItem = { ...unitItem };
//           Object.keys(schema.items?.properties || {}).forEach((unitKey) => {
//             if (validatedUnitItem[unitKey] === undefined) {
//               validatedUnitItem[unitKey] =
//                 schema.items?.properties[unitKey].default;
//             }
//           });
//           return validatedUnitItem;
//         });
//       }
//     });

//     return validatedItem;
//   } catch (error) {
//     console.error(
//       'Error validating and setting defaults for examiner item:',
//       error,
//     );
//     return item; // Return the original item in case of error
//   }
// };

// // Function to remove uncloneable properties
// const removeUncloneableProperties = (item) => {
//   const cloneableItem = { ...item };
//   Object.keys(cloneableItem).forEach((key) => {
//     if (typeof cloneableItem[key] === 'function') {
//       cloneableItem[key] = cloneableItem[key]();
//     }
//   });
//   return cloneableItem;
// };

// Operations for question-Bank

// export const addQuestion = async (item) => {
//   const db = await initDB();
//   const tx = db.transaction(QUESTION_STORE_NAME, 'readwrite');
//   const store = tx.objectStore(QUESTION_STORE_NAME);
//   const validatedItem = validateAndSetDefaults(item);
//   const cloneableItem = removeUncloneableProperties(validatedItem);
//   await store.add(cloneableItem);
//   await tx.done;
// };

// export const getQuestions = async () => {
//   const db = await initDB();
//   const tx = db.transaction(QUESTION_STORE_NAME, 'readonly');
//   const store = tx.objectStore(QUESTION_STORE_NAME);
//   return store.getAll();
// };

// export const deleteQuestion = async (id) => {
//   const db = await initDB();
//   const tx = db.transaction(QUESTION_STORE_NAME, 'readwrite');
//   const store = tx.objectStore(QUESTION_STORE_NAME);
//   await store.delete(id);
//   await tx.done;
// };

// // Function to handle image upload and convert it to a Blob
// export const handleImageUpload = async (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const blob = new Blob([reader.result], { type: file.type });
//       resolve(blob);
//     };
//     reader.onerror = reject;
//     reader.readAsArrayBuffer(file);
//   });
// };

// Operations for station-settings
// export async function saveSetting(settings) {
//   const validatedSettings = validateAndSetDefaultsForSettings(settings);
//   const db = await initDB();
//   const tx = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
//   const store = tx.objectStore(SETTINGS_STORE_NAME);

//   const promises = Object.entries(validatedSettings).map(([key, value]) => {
//     return store.get(key).then((existingEntry) => {
//       if (existingEntry !== undefined) {
//         return store.put({ id: key, value });
//       }
//       return store.add({ id: key, value });
//     });
//   });

//   await Promise.all(promises);

//   await tx.done;
// }

// export async function getSetting(key) {
//   const db = await initDB();
//   const tx = db.transaction(SETTINGS_STORE_NAME, 'readonly');
//   const store = tx.objectStore(SETTINGS_STORE_NAME);

//   const setting = await store.get(key);
//   await tx.done;

//   if (setting !== undefined) {
//     return setting.value;
//   }

//   // Return default value from schema if setting is not found
//   if (settingsSchema[key]) {
//     return settingsSchema[key].default;
//   }

//   return null;
// }

// export async function getAllSettings() {
//   const db = await initDB();
//   const tx = db.transaction(SETTINGS_STORE_NAME, 'readonly');
//   const store = tx.objectStore(SETTINGS_STORE_NAME);
//   const settings = await store.getAll();
//   await tx.done;

//   const result = settings.reduce((acc, { id, value }) => {
//     acc[id] = value;
//     return acc;
//   }, {});

//   // Ensure all settings from the schema are present with default values if not found
//   Object.keys(settingsSchema).forEach((key) => {
//     if (!Object.prototype.hasOwnProperty.call(result, key)) {
//       result[key] = settingsSchema[key].default;
//     }
//   });

//   return result;
// }

// Operations for examiner-list

// Function to check if examinerEmpId is unique
// const isExaminerEmpIdUnique = async (
//   examinerEmpId: number,
// ): Promise<boolean> => {
//   const db = await initDB();
//   const tx = db.transaction(EXAMINER_STORE_NAME, 'readonly');
//   const store = tx.objectStore(EXAMINER_STORE_NAME);
//   const index = store.index('examinerEmpId');
//   const result = await index.get(examinerEmpId);
//   await tx.done;
//   return !result; // If result is null, the id is unique
// };

// // Add a new examiner
// export const addExaminer = async (item) => {
//   try {
//     // Check if examinerEmpId is unique before proceeding
//     const isUnique = await isExaminerEmpIdUnique(item.examinerEmpId);
//     if (!isUnique) {
//       return 'Examiner with the same employee Id already exists. Edit or delete the existing examiner.';
//     }

//     const db = await initDB();
//     const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
//     const store = tx.objectStore(EXAMINER_STORE_NAME);
//     const validatedItem = validateAndSetDefaultsForExaminer(item);
//     const cloneableItem = removeUncloneableProperties(validatedItem);
//     // Check for uniqueness of examinerEmpId
//     // const isUnique = await isExaminerEmpIdUnique(cloneableItem.examinerEmpId);
//     // console.log('isUnique:', isUnique);
//     // if (!isUnique) {
//     //   return 'Examiner with the same employee Id already exists. Edit or delete the existing examiner.';
//     // }

//     await store.add(cloneableItem);
//     await tx.done;
//     return 'Examiner added successfully';
//   } catch (error) {
//     if (error.name === 'ConstraintError') {
//       return 'Examiner with the same employee Id already exists. Edit or delete the existing examiner.';
//     }
//     if (error.name === 'AbortError') {
//       return 'Transaction aborted. Please try again.';
//     }
//     return `Error: ${error.message}`;
//   }
// };

// // Get an examiner by ID
// export const getExaminer = async (id) => {
//   const db = await initDB();
//   const tx = db.transaction(EXAMINER_STORE_NAME, 'readonly');
//   const store = tx.objectStore(EXAMINER_STORE_NAME);
//   const examiner = await store.get(id);
//   return examiner ? validateAndSetDefaultsForExaminer(examiner) : null;
// };

// // Get all examiners
// export const getAllExaminers = async () => {
//   const db = await initDB();
//   const tx = db.transaction(EXAMINER_STORE_NAME, 'readonly');
//   const store = tx.objectStore(EXAMINER_STORE_NAME);
//   const examiners = await store.getAll();
//   return examiners.map(validateAndSetDefaultsForExaminer);
// };

// // Delete an examiner by ID
// export const deleteExaminer = async (id) => {
//   try {
//     const db = await initDB();
//     const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
//     const store = tx.objectStore(EXAMINER_STORE_NAME);
//     await store.delete(id);
//     await tx.done;
//     console.log(`Examiner with ID ${id} deleted successfully.`);
//   } catch (error) {
//     console.error(`Failed to delete examiner with ID ${id}:`, error);
//   }
// };

// // Update an examiner by ID
// export const updateExaminer = async (id, updatedItem) => {
//   const db = await initDB();
//   const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
//   const store = tx.objectStore(EXAMINER_STORE_NAME);
//   const existingItem = await store.get(id);
//   if (!existingItem) {
//     throw new Error('Examiner not found');
//   }
//   const updatedExaminer = {
//     ...existingItem,
//     ...updatedItem,
//     updatedAt: new Date(),
//   };
//   const validatedExaminer = validateAndSetDefaultsForExaminer(updatedExaminer);
//   await store.put(validatedExaminer);
//   await tx.done;
// };

// Operations for review-panel

// export const addReviewPanel = async (data) => {
//   try {
//     const validatedData = validateAndSetDefaultsForReviewPanel(data);

//     const db = await initDB();
//     const tx = db.transaction(REVIEW_PANEL_STORE, 'readwrite');
//     const store = tx.objectStore(REVIEW_PANEL_STORE);

//     await store.add(removeUncloneableProperties(validatedData));
//     await tx.done;
//   } catch (error) {
//     throw new Error(`Failed to add review panel: ${error.message}`);
//   }
// };

// // Get all review panels
// export const getAllReviewPanels = async () => {
//   const db = await initDB();
//   const tx = db.transaction(REVIEW_PANEL_STORE, 'readonly');
//   const store = tx.objectStore(REVIEW_PANEL_STORE);
//   const reviewPanels = await store.getAll();
//   return reviewPanels.map(validateAndSetDefaultsForReviewPanel);
// };

// // Delete a review panel by ID
// export const deleteReviewPanel = async (id) => {
//   try {
//     const db = await initDB();
//     const tx = db.transaction(REVIEW_PANEL_STORE, 'readwrite');
//     const store = tx.objectStore(REVIEW_PANEL_STORE);
//     await store.delete(id);
//     await tx.done;
//     console.log(`Review panel with ID ${id} deleted successfully.`);
//   } catch (error) {
//     console.error(`Failed to delete review panel with ID ${id}:`, error);
//   }
// };

// // Update a review panel by ID
// export const updateReviewPanel = async (id, updatedData) => {
//   const db = await initDB();
//   const tx = db.transaction(REVIEW_PANEL_STORE, 'readwrite');
//   const store = tx.objectStore(REVIEW_PANEL_STORE);
//   const existingData = await store.get(id);
//   if (!existingData) {
//     throw new Error('Review panel not found');
//   }
//   const updatedReviewPanel = {
//     ...existingData,
//     ...updatedData,
//     updatedAt: new Date(),
//   };
//   const validatedReviewPanel =
//     validateAndSetDefaultsForReviewPanel(updatedReviewPanel);
//   await store.put(validatedReviewPanel);
//   await tx.done;
// };

// // Operations for examiner-assignment
// export const addExaminerAssignment = async (data) => {
//   try {
//     const validatedData = validateAndSetDefaultsForExaminerAssignment(data);

//     const db = await initDB();
//     const tx = db.transaction(EXAMINER_ASSIGNMENT_STORE, 'readwrite');
//     const store = tx.objectStore(EXAMINER_ASSIGNMENT_STORE);

//     await store.add(removeUncloneableProperties(validatedData));
//     await tx.done;
//   } catch (error) {
//     throw new Error(`Failed to add examiner assignment: ${error.message}`);
//   }
// };

// // Get all examiner assignments
// export const getAllExaminerAssignments = async () => {
//   const db = await initDB();
//   const tx = db.transaction(EXAMINER_ASSIGNMENT_STORE, 'readonly');
//   const store = tx.objectStore(EXAMINER_ASSIGNMENT_STORE);
//   const examinerAssignments = await store.getAll();
//   return examinerAssignments.map(validateAndSetDefaultsForExaminerAssignment);
// };

// // Delete an examiner assignment by ID
// export const deleteExaminerAssignment = async (id) => {
//   try {
//     const db = await initDB();
//     const tx = db.transaction(EXAMINER_ASSIGNMENT_STORE, 'readwrite');
//     const store = tx.objectStore(EXAMINER_ASSIGNMENT_STORE);
//     await store.delete(id);
//     await tx.done;
//     console.log(`Examiner assignment with ID ${id} deleted successfully.`);
//   } catch (error) {
//     console.error(`Failed to delete examiner assignment with ID ${id}:`, error);
//   }
// };

// // Update an examiner assignment by ID
// export const updateExaminerAssignment = async (id, updatedData) => {
//   const db = await initDB();
//   const tx = db.transaction(EXAMINER_ASSIGNMENT_STORE, 'readwrite');
//   const store = tx.objectStore(EXAMINER_ASSIGNMENT_STORE);
//   const existingData = await store.get(id);
//   if (!existingData) {
//     throw new Error('Examiner assignment not found');
//   }
//   const updatedExaminerAssignment = {
//     ...existingData,
//     ...updatedData,
//     updatedAt: new Date(),
//   };
//   const validatedExaminerAssignment =
//     validateAndSetDefaultsForExaminerAssignment(updatedExaminerAssignment);
//   await store.put(validatedExaminerAssignment);
//   await tx.done;
// };
