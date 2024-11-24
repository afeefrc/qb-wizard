import { EXAMINER_ASSIGNMENT_STORE, initDB } from './initDB';
import { examinerAssignmentSchema } from './schema';
import { removeUncloneableProperties } from './utilFunctions';

const validateAndSetDefaultsForExaminerAssignment = (item) => {
  console.log('item to validate', item);
  return Object.entries(examinerAssignmentSchema).reduce(
    (validatedItem, [key, field]) => {
      const value = item[key] === undefined ? field.default : item[key];
      if (field.validate && !field.validate(value)) {
        throw new Error(`Invalid value for ${key}: ${value}`);
      }
      validatedItem[key] = value;
      console.log('validatedItem', validatedItem);
      return validatedItem;
    },
    {},
  );
};

// Operations for examiner-assignment
export const addExaminerAssignment = async (data) => {
  try {
    const validatedData = validateAndSetDefaultsForExaminerAssignment(data);

    const db = await initDB();
    const tx = db.transaction(EXAMINER_ASSIGNMENT_STORE, 'readwrite');
    const store = tx.objectStore(EXAMINER_ASSIGNMENT_STORE);

    await store.add(removeUncloneableProperties(validatedData));
    await tx.done;
  } catch (error) {
    throw new Error(`Failed to add examiner assignment: ${error.message}`);
  }
};

// Get all examiner assignments
export const getAllExaminerAssignments = async () => {
  const db = await initDB();
  const tx = db.transaction(EXAMINER_ASSIGNMENT_STORE, 'readonly');
  const store = tx.objectStore(EXAMINER_ASSIGNMENT_STORE);
  const examinerAssignments = await store.getAll();
  return examinerAssignments.map(validateAndSetDefaultsForExaminerAssignment);
};

// Delete an examiner assignment by ID
export const deleteExaminerAssignment = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction(EXAMINER_ASSIGNMENT_STORE, 'readwrite');
    const store = tx.objectStore(EXAMINER_ASSIGNMENT_STORE);
    await store.delete(id);
    await tx.done;
    console.log(`Examiner assignment with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete examiner assignment with ID ${id}:`, error);
  }
};

// Update an examiner assignment by ID
export const updateExaminerAssignment = async (id, updatedData) => {
  const db = await initDB();
  const tx = db.transaction(EXAMINER_ASSIGNMENT_STORE, 'readwrite');
  const store = tx.objectStore(EXAMINER_ASSIGNMENT_STORE);
  const existingData = await store.get(id);
  if (!existingData) {
    throw new Error('Examiner assignment not found');
  }
  const updatedExaminerAssignment = {
    ...existingData,
    ...updatedData,
    updatedAt: new Date(),
  };
  const validatedExaminerAssignment =
    validateAndSetDefaultsForExaminerAssignment(updatedExaminerAssignment);
  await store.put(validatedExaminerAssignment);
  await tx.done;
};
