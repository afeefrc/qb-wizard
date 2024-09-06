import { v4 as uuidv4 } from 'uuid';

export const questionsSchema = {
  id: { type: 'string', default: () => uuidv4() },
  unitName: {
    type: 'enum',
    values: ['ADC', 'APP', 'APP(S)', 'ACC', 'ACC(S)', 'OCC'],
    default: 'ADC',
  },
  year: {
    type: 'number',
    default: () => new Date().getFullYear(),
  },
  serialNumber: {
    type: 'number',
  },
  marks: {
    type: 'number',
    default: 1,
    validate: (value) => Number.isInteger(value) && value > 0,
  },
  questionType: { type: 'string', default: '' },
  syllabusSectionId: { type: 'string', default: null },
  questionText: { type: 'string', default: '' },
  trueAnswer: { type: 'boolean', default: true },
  answerText: { type: 'string', default: '' },
  matchPairs: {
    type: 'array',
    default: [],
    items: {
      type: 'object',
      properties: {
        item: { type: 'string', default: '' },
        match: { type: 'string', default: '' },
      },
    },
  },
  answerList: {
    type: 'array',
    default: [],
    items: { type: 'string', default: '' },
  },
  correctOption: { type: 'number', default: 0 },
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
  isDeleted: { type: 'boolean', default: false },
  isEdited: { type: 'boolean', default: false },
  isLatestVersion: { keyPath: 'isLatestVersion', unique: false, default: true },
  isReviewed: { type: 'boolean', default: false },
  createdAt: { type: 'date', default: () => new Date() },
  updatedAt: { type: 'date', default: () => new Date() },
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

export const syllabusSectionSchema = {
  id: { type: 'string', default: () => uuidv4() },
  serialNumber: {
    type: 'number',
    default: 0,
    validate: (value) => Number.isInteger(value) && value >= 0,
  },
  unitName: { type: 'string', default: '' },
  title: { type: 'string', default: '' },
  minWeightage: {
    type: 'number',
    default: 0,
    validate: (value) => Number.isInteger(value) && value >= 0,
  },
  maxWeightage: {
    type: 'number',
    default: 100,
    validate: (value) => Number.isInteger(value) && value >= 0,
  },
  questionPart: {
    type: 'number',
    default: 1,
    validate: (value) => Number.isInteger(value) && value > 0,
  },
  questionsCount: {
    type: 'number',
    default: 0,
    validate: (value) => Number.isInteger(value) && value >= 0,
  },
  createdAt: { type: 'date', default: () => new Date() },
  updatedAt: { type: 'date', default: () => new Date() },
};
