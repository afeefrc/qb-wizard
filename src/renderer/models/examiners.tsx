import { EXAMINER_STORE_NAME, initDB } from './initDB';
import { examinerListSchema } from './schema';
import { removeUncloneableProperties } from './utilFunctions';

type ExaminerItem = {
  [key: string]: any;
};

/// Function to validate and set defaults for examiner items
const validateAndSetDefaultsForExaminer = (
  item: ExaminerItem,
): ExaminerItem => {
  try {
    const validatedItem = { ...item };

    Object.keys(examinerListSchema).forEach((key) => {
      const schema = examinerListSchema[key];
      if (validatedItem[key] === undefined) {
        validatedItem[key] =
          typeof schema.default === 'function'
            ? schema.default()
            : schema.default;
      } else if (key === 'examinerUnits' && Array.isArray(validatedItem[key])) {
        validatedItem[key] = validatedItem[key].map((unitItem) => {
          const validatedUnitItem = { ...unitItem };
          Object.keys(schema.items?.properties || {}).forEach((unitKey) => {
            if (validatedUnitItem[unitKey] === undefined) {
              validatedUnitItem[unitKey] =
                schema.items?.properties[unitKey].default;
            }
          });
          return validatedUnitItem;
        });
      }
    });

    return validatedItem;
  } catch (error) {
    console.error(
      'Error validating and setting defaults for examiner item:',
      error,
    );
    return item; // Return the original item in case of error
  }
};

// Function to check if examinerEmpId is unique
const isExaminerEmpIdUnique = async (
  examinerEmpId: number,
): Promise<boolean> => {
  const db = await initDB();
  const tx = db.transaction(EXAMINER_STORE_NAME, 'readonly');
  const store = tx.objectStore(EXAMINER_STORE_NAME);
  const index = store.index('examinerEmpId');
  const result = await index.get(examinerEmpId);
  await tx.done;
  return !result; // If result is null, the id is unique
};

// Add a new examiner
export const addExaminer = async (item) => {
  try {
    const db = await initDB();
    const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
    const store = tx.objectStore(EXAMINER_STORE_NAME);
    const index = store.index('examinerEmpId');

    // Check if examiner with the same examinerEmpId exists
    const existingExaminer = await index.get(item.examinerEmpId);

    if (existingExaminer) {
      if (existingExaminer.isArchived) {
        // If examiner exists and is archived, update all fields and unarchive
        const updatedExaminer = {
          ...existingExaminer,
          ...item,
          isArchived: false,
          updatedAt: new Date(),
        };
        const validatedExaminer =
          validateAndSetDefaultsForExaminer(updatedExaminer);
        await store.put(validatedExaminer);
        await tx.done;
        return 'Examiner unarchived and updated successfully';
      } else {
        // If examiner exists and is not archived, return an error
        return 'Examiner with the same employee Id already exists. Edit or delete the existing examiner.';
      }
    }

    // If examiner doesn't exist, add a new one

    const validatedItem = validateAndSetDefaultsForExaminer(item);
    const cloneableItem = removeUncloneableProperties(validatedItem);
    await store.add(cloneableItem);
    await tx.done;
    return 'Examiner added successfully';
  } catch (error) {
    if (error.name === 'ConstraintError') {
      return 'Examiner with the same employee Id already exists. Edit or delete the existing examiner.';
    }
    if (error.name === 'AbortError') {
      return 'Transaction aborted. Please try again.';
    }
    return `Error: ${error.message}`;
  }
};

// Get an examiner by ID
export const getExaminer = async (id) => {
  const db = await initDB();
  const tx = db.transaction(EXAMINER_STORE_NAME, 'readonly');
  const store = tx.objectStore(EXAMINER_STORE_NAME);
  const examiner = await store.get(id);
  return examiner ? validateAndSetDefaultsForExaminer(examiner) : null;
};

// Get all examiners
export const getAllExaminers = async () => {
  const db = await initDB();
  const tx = db.transaction(EXAMINER_STORE_NAME, 'readonly');
  const store = tx.objectStore(EXAMINER_STORE_NAME);
  const examiners = await store.getAll();
  return examiners.map(validateAndSetDefaultsForExaminer);
};

// Delete an examiner by ID
export const deleteExaminer = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
    const store = tx.objectStore(EXAMINER_STORE_NAME);
    await store.delete(id);
    await tx.done;
    console.log(`Examiner with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete examiner with ID ${id}:`, error);
  }
};

// Update an examiner by ID
export const updateExaminer = async (id, updatedItem) => {
  const db = await initDB();
  const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
  const store = tx.objectStore(EXAMINER_STORE_NAME);
  const existingItem = await store.get(id);
  if (!existingItem) {
    throw new Error('Examiner not found');
  }
  const updatedExaminer = {
    ...existingItem,
    ...updatedItem,
    updatedAt: new Date(),
  };
  const validatedExaminer = validateAndSetDefaultsForExaminer(updatedExaminer);
  await store.put(validatedExaminer);
  await tx.done;
};
