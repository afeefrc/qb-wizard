import { v4 as uuidv4 } from 'uuid';

export const questionsSchema = {
  id: { type: 'string', default: () => uuidv4() },
  unitName: {
    type: 'enum',
    values: ['ADC', 'APP', 'APP(S)', 'ACC', 'ACC(S)', 'OCC'],
    default: 'ADC',
  },
  marks: {
    type: 'number',
    default: 1,
    validate: (value) => Number.isInteger(value) && value > 0,
  },
  questionType: { type: 'string', default: '' },
  questionText: { type: 'string', default: '' },
  trueAnswer: { type: 'boolean', default: true },
  answerText: { type: 'string', default: '' },
  keyValuePairs: { type: 'object', default: {} },
  image: { type: 'blob', default: null },
  linkedQuestion: { type: 'array', default: [] },
  mandatory: { type: 'boolean', default: false },
  difficultyLevel: {
    type: 'enum',
    values: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  moduleNumber: {
    type: 'number',
    default: 1,
    validate: (value) => [0, 1, 2, 3, 4, 5].includes(value),
  },
  comments: { type: 'string', default: '' },
  isReviewed: { type: 'boolean', default: false },
};

export const settingsSchema = {
  theme: { type: 'string', default: 'light' },
  notificationsEnabled: { type: 'boolean', default: true },
  stationCode: { type: 'string', default: '' },
  stationName: { type: 'string', default: '' },
  stationCity: { type: 'string', default: '' },
  unitsApplicable: { type: 'array', default: [] },
};

export const examinerListSchema = {
  id: { type: 'string', default: () => uuidv4() },
  examinerName: { type: 'string', default: '' },
  examinerEmpId: { type: 'number', unique: true },
  examinerDesignation: { type: 'string', default: '' },
  examinerUnits: {
    type: 'array',
    default: [],
    items: {
      type: 'object',
      properties: {
        unit: { type: 'string' },
        validityDate: { type: 'date', default: null },
      },
    },
  },
  // examinerValidity: { type: 'date', default: null },
  isIncharge: { type: 'boolean', default: false },
  createdAt: { type: 'date', default: () => new Date() },
  updatedAt: { type: 'date', default: () => new Date() },
};

export const reviewPanelSchema = {
  id: { type: 'string', default: () => uuidv4() },
  unit: { type: 'string', default: '' }, // Possible values: 'ADC', 'APP', 'APP(S)', 'ACC', 'ACC(S)', 'OCC'
  description: { type: 'string', default: '' },
  members: { type: 'array', default: [] }, // This should reference examinerListSchema entries
  chairman: {
    type: 'string',
    default: '',
    // validate: (value, context) =>
    //   !context.members.length || context.members.includes(value), // Ensure chairman is in members or empty if members is empty
  },
  status: { type: 'string', default: 'initiated' }, // Possible values: 'initiated', 'in process', 'submitted', 'approved', 'rejected'
  content: { type: 'array', default: [] },
  deadline: { type: 'date', default: null },
  comments_initiate: { type: 'string', default: '' },
  comments_submit: { type: 'string', default: '' },
  comments_approval: { type: 'string', default: '' },
  comments_forward: { type: 'string', default: '' },
  createdAt: { type: 'date', default: () => new Date() },
  updatedAt: { type: 'date', default: () => new Date() },
};

export const validateAndSetDefaultsForReviewPanel = (item) => {
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

// export const validateAndSetDefaultsForReviewPanel = (item) => {
//   console.log('item to validate', item);
//   return Object.entries(reviewPanelSchema).reduce(
//     (validatedItem, [key, field]) => {
//       const value =
//         item[key] === undefined
//           ? typeof field.default === 'function'
//             ? field.default()
//             : field.default
//           : item[key];
//       if (field.validate && !field.validate(value)) {
//         throw new Error(`Invalid value for ${key}: ${value}`);
//       }
//       validatedItem[key] = value;
//       console.log('validatedItem', validatedItem);
//       return validatedItem;
//     },
//     {},
//   );
// };

export const examinerAssignmentSchema = {
  id: { type: 'string', default: () => uuidv4() },
  unit: { type: 'string', default: '' }, // Possible values: 'ADC', 'APP', 'APP(S)', 'ACC', 'ACC(S)', 'OCC'
  description: { type: 'string', default: '' },
  examiner: { type: 'string', default: '' },
  examiner_invigilator: { type: 'string', default: '' },
  examiner_evaluation: { type: 'string', default: '' },
  status: { type: 'string', default: 'initiated' }, // Possible values: 'initiated', 'in process', 'submitted', 'approved', 'rejected'
  content: { type: 'array', default: [] },
  deadline: { type: 'date', default: null },
  comments_initiate: { type: 'string', default: '' },
  comments_submit: { type: 'string', default: '' },
  comments_approval: { type: 'string', default: '' },
  comments_forward: { type: 'string', default: '' },
  createdAt: { type: 'date', default: () => new Date() },
  updatedAt: { type: 'date', default: () => new Date() },
};

export const validateAndSetDefaultsForExaminerAssignment = (item) => {
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
