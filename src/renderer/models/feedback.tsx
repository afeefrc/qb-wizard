import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { FEEDBACK_STORE, initDB } from './initDB';
import { feedbackSchema } from './schema';
import { removeUncloneableProperties } from './utilFunctions';

// Define the structure of a comment
interface Comment {
  id: string;
  examinerId: string;
  unit?: string;
  examinerAssignmentId?: string;
  questionId?: string;
  comment: string;
  tags?: string[];
  commentTime: Date;
}

// Define the structure of a feedback entry
interface Feedback {
  id: string;
  questionBankComments: Comment[];
  questionPaperComments: Comment[];
  questionComment: Comment[];
  // ... other properties based on your schema
}

// Define a union type for comment fields
type CommentField =
  | 'questionBankComments'
  | 'questionPaperComments'
  | 'questionComment';

const validateAndSetDefaultsForFeedback = (item) => {
  return Object.entries(feedbackSchema).reduce(
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

/**
 * Retrieves the feedback data from the feedback store.
 * @returns The validated and cleaned Feedback object or undefined if not found.
 */
export const getFeedback = async (): Promise<Feedback | undefined> => {
  try {
    const feedbackStore = await getFeedbackStore(); // Get the feedback store

    // Retrieve the single feedback entry
    const existingFeedback: Feedback | undefined = await feedbackStore.get(
      'singleFeedbackEntry',
    );

    // If it doesn't exist, log a warning and return undefined
    if (!existingFeedback) {
      console.warn('No existing feedback entry found.');
      return undefined;
    }

    // Validate and set default values for the feedback
    const validatedFeedback =
      validateAndSetDefaultsForFeedback(existingFeedback);

    // Remove any uncloneable properties from the feedback
    const cleanedFeedback = removeUncloneableProperties(validatedFeedback);

    return cleanedFeedback; // Return the processed feedback
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    throw error; // Re-throw the error after logging it
  }
};

const getFeedbackStore = async () => {
  const db = await initDB(); // Initialize the database
  return db
    .transaction(FEEDBACK_STORE, 'readwrite')
    .objectStore(FEEDBACK_STORE); // Access the feedback store
};

/**
 * Adds a new comment to the specified comment field in feedback.
 * @param field - The name of the comment field (e.g., 'questionBankComments')
 * @param newComment - The comment details to add.
 */
export const addComment = async (
  field: CommentField,
  newComment: Partial<Comment>,
) => {
  try {
    const feedbackStore = await getFeedbackStore(); // Get the feedback store

    // Retrieve the single feedback entry
    let existingFeedback: Feedback | undefined = await feedbackStore.get(
      'singleFeedbackEntry',
    );

    // If it doesn't exist, create it
    if (!existingFeedback) {
      existingFeedback = {
        id: 'singleFeedbackEntry',
        questionBankComments: [],
        questionPaperComments: [],
        questionComment: [],
        // ... initialize other fields as per your schema
      };
      await feedbackStore.add(existingFeedback);
    }

    // Create a new comment object with a unique id
    const commentEntry: Comment = {
      id: uuidv4(), // Generate a unique ID for the comment
      examinerId: newComment.examinerId || '',
      unit: newComment.unit || '',
      examinerAssignmentId: newComment.examinerAssignmentId || '',
      questionId: newComment.questionId || '',
      comment: newComment.comment || '',
      tags: newComment.tags || [],
      commentTime: new Date(),
    };

    const updatedComments = [...(existingFeedback[field] || []), commentEntry];

    const updatedFeedback: Feedback = {
      ...existingFeedback,
      [field]: updatedComments,
    };

    const validatedFeedback =
      validateAndSetDefaultsForFeedback(updatedFeedback);
    const cleanedFeedback = removeUncloneableProperties(validatedFeedback);

    await feedbackStore.put(cleanedFeedback); // Update the feedback entry
    return cleanedFeedback;
  } catch (error) {
    console.error(`Error adding comment to ${field}:`, error);
    throw error; // Re-throw the error after logging it
  }
};

// /**
//  * Deletes all comments in the questionBankComments field.
//  */
// export const deleteAllQuestionBankComments = async () => {
//   try {
//     const feedbackStore = await getFeedbackStore(); // Get the feedback store

//     // Retrieve the single feedback entry
//     let existingFeedback: Feedback | undefined = await feedbackStore.get(
//       'singleFeedbackEntry',
//     );

//     // If it doesn't exist, nothing to delete
//     if (!existingFeedback) {
//       console.warn('No existing feedback entry found.');
//       return;
//     }

//     // Clear all comments
//     existingFeedback.questionBankComments = [];

//     const validatedFeedback =
//       validateAndSetDefaultsForFeedback(existingFeedback);
//     const cleanedFeedback = removeUncloneableProperties(validatedFeedback);

//     await feedbackStore.put(cleanedFeedback); // Update the feedback entry
//     return cleanedFeedback;
//   } catch (error) {
//     console.error('Error deleting all question bank comments:', error);
//     throw error; // Re-throw the error after logging it
//   }
// };

// /**
//  * Deletes a specific comment from questionBankComments based on commentId.
//  * @param commentId - The unique identifier of the comment to delete.
//  */
// export const deleteQuestionBankComment = async (commentId: string) => {
//   try {
//     const feedbackStore = await getFeedbackStore(); // Get the feedback store

//     // Retrieve the single feedback entry
//     let existingFeedback: Feedback | undefined = await feedbackStore.get(
//       'singleFeedbackEntry',
//     );

//     // If it doesn't exist, nothing to delete
//     if (!existingFeedback) {
//       throw new Error('Feedback entry not found.');
//     }

//     // Filter out the comment with the specified commentId
//     const updatedComments = existingFeedback.questionBankComments.filter(
//       (comment) => comment.id !== commentId,
//     );

//     // Check if a comment was actually removed
//     if (
//       updatedComments.length === existingFeedback.questionBankComments.length
//     ) {
//       console.warn(`No comment found with commentId: ${commentId}`);
//       return existingFeedback;
//     }

//     existingFeedback.questionBankComments = updatedComments;

//     const validatedFeedback =
//       validateAndSetDefaultsForFeedback(existingFeedback);
//     const cleanedFeedback = removeUncloneableProperties(validatedFeedback);

//     await feedbackStore.put(cleanedFeedback); // Update the feedback entry
//     return cleanedFeedback;
//   } catch (error) {
//     console.error(
//       `Error deleting question bank comment with ID ${commentId}:`,
//       error,
//     );
//     throw error; // Re-throw the error after logging it
//   }
// };

/**
 * Deletes all comments from the specified comment field in feedback.
 * @param field - The name of the comment field (e.g., 'questionBankComments')
 */
export const deleteAllComments = async (field: CommentField) => {
  try {
    const feedbackStore = await getFeedbackStore(); // Get the feedback store

    // Retrieve the single feedback entry
    let existingFeedback: Feedback | undefined = await feedbackStore.get(
      'singleFeedbackEntry',
    );

    // If it doesn't exist, nothing to delete
    if (!existingFeedback) {
      console.warn('No existing feedback entry found.');
      return;
    }

    // Clear all comments in the specified field
    existingFeedback[field] = [];

    const validatedFeedback =
      validateAndSetDefaultsForFeedback(existingFeedback);
    const cleanedFeedback = removeUncloneableProperties(validatedFeedback);

    await feedbackStore.put(cleanedFeedback); // Update the feedback entry
    return cleanedFeedback;
  } catch (error) {
    console.error(`Error deleting all comments from ${field}:`, error);
    throw error; // Re-throw the error after logging it
  }
};

/**
 * Deletes a specific comment from the specified comment field in feedback based on comment id.
 * @param field - The name of the comment field (e.g., 'questionBankComments')
 * @param commentId - The unique identifier of the comment to delete.
 */
export const deleteComment = async (field: CommentField, commentId: string) => {
  try {
    const feedbackStore = await getFeedbackStore(); // Get the feedback store

    // Retrieve the single feedback entry
    let existingFeedback: Feedback | undefined = await feedbackStore.get(
      'singleFeedbackEntry',
    );

    // If it doesn't exist, nothing to delete
    if (!existingFeedback) {
      throw new Error('Feedback entry not found.');
    }

    // Filter out the comment with the specified commentId
    const updatedComments = existingFeedback[field].filter(
      (comment) => comment.id !== commentId,
    );

    // Check if a comment was actually removed
    if (updatedComments.length === existingFeedback[field].length) {
      console.warn(`No comment found with id: ${commentId}`);
      return existingFeedback;
    }

    existingFeedback[field] = updatedComments;

    const validatedFeedback =
      validateAndSetDefaultsForFeedback(existingFeedback);
    const cleanedFeedback = removeUncloneableProperties(validatedFeedback);

    await feedbackStore.put(cleanedFeedback); // Update the feedback entry
    return cleanedFeedback;
  } catch (error) {
    console.error(
      `Error deleting comment with ID ${commentId} from ${field}:`,
      error,
    );
    throw error; // Re-throw the error after logging it
  }
};
