import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import {
  sampleSettings,
  sampleExaminers,
  sampleSyllabusSections,
  sampleQuestions,
} from './dev_populateData';
import { initialTrgInChargeProfile } from '../StaticData';

export const DB_NAME = 'my-database';
export const DB_VERSION = 1;
export const QUESTION_STORE_NAME = 'question-bank';
export const PENDING_CHANGES_STORE_NAME = 'pending-changes';
export const SETTINGS_STORE_NAME = 'app-settings';
export const EXAMINER_STORE_NAME = 'examiner-list';
export const REVIEW_PANEL_STORE = 'review-panel';
export const EXAMINER_ASSIGNMENT_STORE = 'examiner-assignment';
export const SYLLABUS_SECTIONS_STORE = 'syllabus-sections';
export const LINKED_QUESTIONS_STORE = 'linked-questions';
export const USER_ACTIVITY_LOG_STORE = 'user-activity-log';
export const FEEDBACK_STORE = 'feedback';

// // Create initial admin data
// const createInitialAdmin = {
//   id: '1', // Set a fixed ID for admin
//   examinerName: 'Training Incharge',
//   examinerEmpId: 1,
//   examinerDesignation: 'Admin',
//   examinerUnits: [],
//   isIncharge: true,
//   role: 'trgIncharge',
//   authMethod: 'none',
//   isFirstLogin: true,
//   hasPassword: false,
//   password: null,
//   totpEnabled: false,
//   totpSecret: null,
//   backupCodes: [],
//   loginAttempts: 0,
//   lockedUntil: null,
//   lastLogin: null,
//   createdAt: new Date(),
//   updatedAt: new Date(),
// };

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(QUESTION_STORE_NAME)) {
        const store = db.createObjectStore(QUESTION_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('unitNameYearIndex', ['unitName', 'year']);

        if (process.env.NODE_ENV === 'development') {
          sampleQuestions.forEach((question) => store.add(question));
          console.log(
            '[development] Sample question bank populated successfully',
          );
        }
      }
      // Create pending-changes store if it doesn't exist.
      // This store will be used to store the pending changes to the question-bank.
      if (!db.objectStoreNames.contains(PENDING_CHANGES_STORE_NAME)) {
        const pendingChangesStore = db.createObjectStore(
          PENDING_CHANGES_STORE_NAME,
          { keyPath: 'id', autoIncrement: true },
        );
        pendingChangesStore.createIndex('typeIndex', 'type');
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        const settingsStore = db.createObjectStore(SETTINGS_STORE_NAME, {
          keyPath: 'id',
        });

        // populate sample settings
        if (process.env.NODE_ENV === 'development') {
          Object.entries(sampleSettings).forEach(([key, value]) =>
            settingsStore.add({ id: key, value }),
          );
          console.log(
            '[development] Sample station settings populated successfully',
          );
        }
      }
      // Create examiner-list if it doesn't exist
      if (!db.objectStoreNames.contains(EXAMINER_STORE_NAME)) {
        const examinerStore = db.createObjectStore(EXAMINER_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        // Create an index on examinerEmpId with unique constraint
        examinerStore.createIndex('examinerEmpId', 'examinerEmpId', {
          unique: true,
        });
        // if (process.env.NODE_ENV === 'development') {
        //   sampleExaminers.forEach((examiner) => examinerStore.add(examiner));
        //   console.log(
        //     '[development] Sample examiner list populated successfully',
        //   );
        // }
        // Add the initial admin user
        examinerStore.add(initialTrgInChargeProfile);
      }
      if (!db.objectStoreNames.contains(REVIEW_PANEL_STORE)) {
        db.createObjectStore(REVIEW_PANEL_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(EXAMINER_ASSIGNMENT_STORE)) {
        db.createObjectStore(EXAMINER_ASSIGNMENT_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(SYLLABUS_SECTIONS_STORE)) {
        const syllabusSectionsStore = db.createObjectStore(
          SYLLABUS_SECTIONS_STORE,
          {
            keyPath: 'id',
            autoIncrement: true,
          },
        );
        if (process.env.NODE_ENV === 'development') {
          sampleSyllabusSections.forEach((section) =>
            syllabusSectionsStore.add(section),
          );
          console.log(
            '[development] Sample syllabus sections populated successfully',
          );
        }
      }
      if (!db.objectStoreNames.contains(LINKED_QUESTIONS_STORE)) {
        db.createObjectStore(LINKED_QUESTIONS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(USER_ACTIVITY_LOG_STORE)) {
        db.createObjectStore(USER_ACTIVITY_LOG_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(FEEDBACK_STORE)) {
        const feedbackStore = db.createObjectStore(FEEDBACK_STORE, {
          keyPath: 'id',
        });

        // Initialize with a single entry if in development or production as needed
        const initialFeedback = {
          id: 'singleFeedbackEntry',
          questionBankComments: [], // Initialize with empty comments
          questionPaperComments: [], // Initialize with empty comments
          questionComment: [], // Initialize with empty comments
        };

        feedbackStore.add(initialFeedback);
      }
    },
  });
};
