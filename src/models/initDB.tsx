import { openDB } from 'idb';

export const DB_NAME = 'my-database';
export const DB_VERSION = 1;
export const QUESTION_STORE_NAME = 'question-bank';
export const SETTINGS_STORE_NAME = 'app-settings';
export const EXAMINER_STORE_NAME = 'examiner-list';
export const REVIEW_PANEL_STORE = 'review-panel';
export const EXAMINER_ASSIGNMENT_STORE = 'examiner-assignment';
export const SYLLABUS_SECTIONS_STORE = 'syllabus-sections';

// populate sample data [development mode only]
import {
  sampleSettings,
  sampleExaminers,
  sampleSyllabusSections,
} from './dev_populateData';

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(QUESTION_STORE_NAME)) {
        db.createObjectStore(QUESTION_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
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
        if (process.env.NODE_ENV === 'development') {
          sampleExaminers.forEach((examiner) => examinerStore.add(examiner));
          console.log(
            '[development] Sample examiner list populated successfully',
          );
        }
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
    },
  });
};