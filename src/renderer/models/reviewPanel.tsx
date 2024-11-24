import { REVIEW_PANEL_STORE, initDB } from './initDB';
import { reviewPanelSchema } from './schema';
import { removeUncloneableProperties } from './utilFunctions';

const validateAndSetDefaultsForReviewPanel = (item) => {
  console.log('item to validate', item);
  return Object.entries(reviewPanelSchema).reduce(
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

export const addReviewPanel = async (data) => {
  try {
    const validatedData = validateAndSetDefaultsForReviewPanel(data);

    const db = await initDB();
    const tx = db.transaction(REVIEW_PANEL_STORE, 'readwrite');
    const store = tx.objectStore(REVIEW_PANEL_STORE);

    await store.add(removeUncloneableProperties(validatedData));
    await tx.done;
  } catch (error) {
    throw new Error(`Failed to add review panel: ${error.message}`);
  }
};

// Get all review panels
export const getAllReviewPanels = async () => {
  const db = await initDB();
  const tx = db.transaction(REVIEW_PANEL_STORE, 'readonly');
  const store = tx.objectStore(REVIEW_PANEL_STORE);
  const reviewPanels = await store.getAll();
  return reviewPanels.map(validateAndSetDefaultsForReviewPanel);
};

// Delete a review panel by ID
export const deleteReviewPanel = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction(REVIEW_PANEL_STORE, 'readwrite');
    const store = tx.objectStore(REVIEW_PANEL_STORE);
    await store.delete(id);
    await tx.done;
    console.log(`Review panel with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete review panel with ID ${id}:`, error);
  }
};

// Update a review panel by ID
export const updateReviewPanel = async (id, updatedData) => {
  const db = await initDB();
  const tx = db.transaction(REVIEW_PANEL_STORE, 'readwrite');
  const store = tx.objectStore(REVIEW_PANEL_STORE);
  const existingData = await store.get(id);
  if (!existingData) {
    throw new Error('Review panel not found');
  }
  const updatedReviewPanel = {
    ...existingData,
    ...updatedData,
    updatedAt: new Date(),
  };
  const validatedReviewPanel =
    validateAndSetDefaultsForReviewPanel(updatedReviewPanel);
  await store.put(validatedReviewPanel);
  await tx.done;
};
