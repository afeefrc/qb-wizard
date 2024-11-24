import { USER_ACTIVITY_LOG_STORE, initDB } from './initDB';
import { userActivityLogSchema } from './schema';
import { removeUncloneableProperties } from './utilFunctions';

const validateAndSetDefaultsForUserActivityLog = (item) => {
  console.log('item to validate', item);
  return Object.entries(userActivityLogSchema).reduce(
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

export const addUserActivityLog = async (data) => {
  try {
    const validatedData = validateAndSetDefaultsForUserActivityLog(data);

    const db = await initDB();
    const tx = db.transaction(USER_ACTIVITY_LOG_STORE, 'readwrite');
    const store = tx.objectStore(USER_ACTIVITY_LOG_STORE);

    await store.add(removeUncloneableProperties(validatedData));
    await tx.done;
  } catch (error) {
    throw new Error(`Failed to add user activity log: ${error.message}`);
  }
};

export const getAllUserActivityLogs = async () => {
  const db = await initDB();
  const tx = db.transaction(USER_ACTIVITY_LOG_STORE, 'readonly');
  const store = tx.objectStore(USER_ACTIVITY_LOG_STORE);
  return store.getAll();
};
