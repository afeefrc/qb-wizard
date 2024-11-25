import { EXAMINER_STORE_NAME, initDB } from './initDB';
import { examinerListSchema } from './schema';
import { removeUncloneableProperties } from './utilFunctions';

type ExaminerItem = {
  [key: string]: any;
  id: string;
  examinerName: string;
  examinerEmpId: number;
  role: 'admin' | 'examiner';
  authMethod: 'password' | 'totp' | 'none';
  isFirstLogin: boolean;
  passwordResetRequired?: boolean;
  totpResetRequired?: boolean;
  password?: string;
  hasPassword: boolean;
  totpSecret?: string;
  totpEnabled: boolean;
  backupCodes: string[];
  loginAttempts: number;
  lockedUntil?: Date;
  lastLogin?: Date;
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
export const addExaminer = async (item: Partial<ExaminerItem>) => {
  try {
    const db = await initDB();
    const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
    const store = tx.objectStore(EXAMINER_STORE_NAME);

    // Check for existing archived examiner
    const index = store.index('examinerEmpId');
    const existingExaminer = await index.get(item.examinerEmpId);

    if (existingExaminer && existingExaminer.isArchived) {
      // Reactivate archived examiner
      const reactivatedExaminer = {
        ...existingExaminer,
        ...item,
        isArchived: false,
        isFirstLogin: true,
        authMethod: 'none' as const,
        hasPassword: false,
        totpEnabled: false,
        password: null,
        totpSecret: null,
        backupCodes: [],
        loginAttempts: 0,
      };

      const validatedItem =
        validateAndSetDefaultsForExaminer(reactivatedExaminer);
      const cloneableItem = removeUncloneableProperties(validatedItem);
      await store.put(cloneableItem);
      await tx.done;
      return 'Archived examiner reactivated successfully';
    }

    // Initialize auth-related fields for new examiner
    const newExaminer = {
      ...item,
      isFirstLogin: true,
      authMethod: 'none' as const,
      hasPassword: false,
      totpEnabled: false,
      password: null,
      totpSecret: null,
      backupCodes: [],
      loginAttempts: 0,
      role: item.role || 'examiner',
    };

    const validatedItem = validateAndSetDefaultsForExaminer(newExaminer);
    const cloneableItem = removeUncloneableProperties(validatedItem);
    await store.add(cloneableItem);
    await tx.done;
    return 'Examiner added successfully';
  } catch (error) {
    if (error.name === 'ConstraintError') {
      return 'Examiner with the same employee Id already exists and is not archived';
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

// Update the generateSecureRandomString function
const generateSecureRandomString = async (length: number): Promise<string> => {
  return window.electron.crypto.generateRandomString(length);
};

// Setup password authentication
export const setupPasswordAuth = async (
  examinerEmpId: number,
  password: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // First transaction: Read the examiner (readonly)
    const db = await initDB();
    const readTx = db.transaction(EXAMINER_STORE_NAME, 'readonly');
    const store = readTx.objectStore(EXAMINER_STORE_NAME);
    const index = store.index('examinerEmpId');
    const examiner = await index.get(examinerEmpId);
    await readTx.done;

    if (!examiner) {
      return { success: false, message: 'Examiner not found' };
    }

    // Hash the password
    const hashedPassword = await window.electron.crypto.hashPassword(password);

    // Second transaction: Update the examiner (readwrite)
    const writeTx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
    const writeStore = writeTx.objectStore(EXAMINER_STORE_NAME);

    const updatedExaminer = {
      ...examiner,
      password: hashedPassword,
      hasPassword: true,
      authMethod: 'password',
      updatedAt: new Date(),
    };

    await writeStore.put(updatedExaminer);
    await writeTx.done;

    return {
      success: true,
      message: 'Password setup successful',
    };
  } catch (error) {
    console.error('Password setup error:', error);
    return {
      success: false,
      message: error.message || 'Failed to setup password',
    };
  }
};

// Setup TOTP authentication
export const setupTOTPAuth = async (
  examinerEmpId: number,
): Promise<{
  success: boolean;
  message: string;
  totpSecret?: string;
  backupCodes?: string[];
}> => {
  try {
    console.log('Starting TOTP setup for examiner:', examinerEmpId);

    const db = await initDB();
    const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
    const store = tx.objectStore(EXAMINER_STORE_NAME);
    const index = store.index('examinerEmpId');
    const examiner = await index.get(examinerEmpId);

    if (!examiner) {
      return { success: false, message: 'Examiner not found' };
    }

    // Generate new TOTP secret
    const totpSecret = await window.electron.totp.generateSecret();
    console.log('Generated TOTP secret:', totpSecret);

    // Generate backup codes
    const backupCodes = await Promise.all(
      Array.from({ length: 8 }, () =>
        window.electron.crypto.generateRandomString(10),
      ),
    );
    console.log('Generated backup codes:', backupCodes);

    // Don't update examiner yet - wait for completeTOTPSetup
    // Just return the secret and backup codes for QR code display
    return {
      success: true,
      message: 'TOTP setup initiated successfully',
      totpSecret,
      backupCodes,
    };
  } catch (error) {
    console.error('TOTP setup error:', error);
    return {
      success: false,
      message: error.message || 'Failed to setup TOTP',
    };
  }
};

// Complete TOTP setup (called after user has scanned QR code)
export const completeTOTPSetup = async (
  examinerEmpId: number,
  totpSecret: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const db = await initDB();
    const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
    const store = tx.objectStore(EXAMINER_STORE_NAME);
    const index = store.index('examinerEmpId');
    const examiner = await index.get(examinerEmpId);

    if (!examiner) {
      return { success: false, message: 'Examiner not found' };
    }

    const updatedExaminer = {
      ...examiner,
      totpSecret,
      totpEnabled: true,
      authMethod: 'totp',
      totpResetRequired: false,
      updatedAt: new Date(),
    };

    await store.put(updatedExaminer);
    await tx.done;

    return {
      success: true,
      message: 'TOTP setup completed successfully',
    };
  } catch (error) {
    console.error('TOTP completion error:', error);
    return {
      success: false,
      message: error.message || 'Failed to complete TOTP setup',
    };
  }
};

// Update password verification in authenticateExaminer
export const authenticateExaminer = async (
  examinerEmpId: number,
  credentials: { password?: string; totpToken?: string },
): Promise<{
  success: boolean;
  message: string;
  examiner?: ExaminerItem;
}> => {
  try {
    console.log('Starting authentication for:', examinerEmpId);

    // First get the examiner in a readonly transaction
    const db = await initDB();
    const readTx = db.transaction(EXAMINER_STORE_NAME, 'readonly');
    const store = readTx.objectStore(EXAMINER_STORE_NAME);
    const index = store.index('examinerEmpId');
    const examiner = await index.get(examinerEmpId);
    await readTx.done;

    if (!examiner) {
      return {
        success: false,
        message: 'Examiner not found',
        examiner: null,
      };
    }

    // Check if any authentication method is set up
    if (!examiner.hasPassword && !examiner.totpEnabled) {
      return {
        success: false,
        message: 'Authentication setup required',
        examiner: examiner,
      };
    }

    // Try password authentication if credentials provided
    if (credentials.password && examiner.hasPassword) {
      const isPasswordValid = await window.electron.crypto.verifyPassword(
        credentials.password,
        examiner.password,
      );

      if (isPasswordValid) {
        return {
          success: true,
          message: 'Authentication successful',
          examiner: examiner,
        };
      }
    }

    // Try TOTP authentication if credentials provided
    if (credentials.totpToken && examiner.totpEnabled) {
      const isTokenValid = await window.electron.totp.verifyToken(
        examiner.totpSecret,
        credentials.totpToken,
      );

      if (isTokenValid) {
        return {
          success: true,
          message: 'Authentication successful',
          examiner: examiner,
        };
      }
    }

    // If we reach here, authentication failed
    if (credentials.password && examiner.hasPassword) {
      return {
        success: false,
        message: 'Invalid password',
        examiner: null,
      };
    }

    if (credentials.totpToken && examiner.totpEnabled) {
      return {
        success: false,
        message: 'Invalid authentication code',
        examiner: null,
      };
    }

    // If no matching credentials provided
    const availableMethods = [];
    if (examiner.hasPassword) availableMethods.push('password');
    if (examiner.totpEnabled) availableMethods.push('TOTP');

    return {
      success: false,
      message: `Please authenticate using ${availableMethods.join(' or ')}`,
      examiner: examiner,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: error.message || 'Authentication failed',
      examiner: null,
    };
  }
};

export const setupNewCredentials = async (
  examinerEmpId: number,
  setup: {
    newPassword?: string;
    setupTOTP?: boolean;
    authMethod: 'password' | 'totp'; // Removed 'both' option
  },
): Promise<{
  success: boolean;
  message: string;
  totpSecret?: string;
  backupCodes?: string[];
}> => {
  try {
    const db = await initDB();
    const tx = db.transaction(EXAMINER_STORE_NAME, 'readwrite');
    const store = tx.objectStore(EXAMINER_STORE_NAME);
    const index = store.index('examinerEmpId');
    const examiner = await index.get(examinerEmpId);

    if (!examiner) {
      return { success: false, message: 'Examiner not found' };
    }

    // Reset all auth methods first
    examiner.hasPassword = false;
    examiner.password = null;
    examiner.totpEnabled = false;
    examiner.totpSecret = null;
    examiner.backupCodes = [];

    // Handle password setup
    if (setup.authMethod === 'password') {
      if (!setup.newPassword) {
        return { success: false, message: 'New password is required' };
      }
      try {
        examiner.password = await window.electron.crypto.hashPassword(
          setup.newPassword,
        );
        examiner.hasPassword = true;
        examiner.passwordResetRequired = false;
      } catch (error) {
        console.error('Password hashing error:', error);
        return { success: false, message: 'Failed to set up password' };
      }
    }

    // Handle TOTP setup
    if (setup.authMethod === 'totp') {
      try {
        examiner.totpSecret = await window.electron.totp.generateSecret();
        examiner.totpEnabled = true;
        examiner.totpResetRequired = false;
        examiner.backupCodes = await Promise.all(
          Array.from({ length: 8 }, () =>
            window.electron.crypto.generateRandomString(10),
          ),
        );
      } catch (error) {
        console.error('TOTP setup error:', error);
        return { success: false, message: 'Failed to set up TOTP' };
      }
    }

    examiner.authMethod = setup.authMethod;
    examiner.updatedAt = new Date();

    try {
      await store.put(examiner);
      await tx.done;

      return {
        success: true,
        message: 'Authentication updated successfully',
        totpSecret: examiner.totpSecret,
        backupCodes: examiner.backupCodes,
      };
    } catch (error) {
      console.error('Database update error:', error);
      return { success: false, message: 'Failed to save authentication setup' };
    }
  } catch (error) {
    console.error('Error setting up new credentials:', error);
    return { success: false, message: 'Failed to setup new credentials' };
  }
};
