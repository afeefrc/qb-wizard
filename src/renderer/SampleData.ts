const units = [
  {
    id: 'ADC',
    label: 'ADC',
  },
  {
    id: 'ACC',
    label: 'ACC',
  },
];

export const unitOptions = ['ADC', 'APP', 'APP(S)', 'ACC', 'ACC(S)', 'OCC'];
export const unitsFullNames = [
  { id: 'ADC', label: 'Aerodrome Control' },
  { id: 'APP', label: 'Appraoch Control (Procedural)' },
  { id: 'APP(S)', label: 'Appraoch Control (Surveillance)' },
  { id: 'ACC', label: 'Area Control (Procedural)' },
  { id: 'ACC(S)', label: 'Area Control (Surveillance)' },
  { id: 'OCC', label: 'Oceanic Control' },
];

// helper function to get the full name of a unit by its id (id is the short form)
export const getUnitNameById = (id) => {
  const unit = unitsFullNames.find((unit) => unit.id === id);
  return unit ? unit.label : id; // Return the label if found, otherwise return the id itself
};

export const designationList = ['JGM', 'DGM', 'AGM', 'SM', 'MGR', 'AM', 'JE'];

export const stations = [
  {
    code: 'VOBL',
    name: 'Kempegowda International Airport',
    city: 'Bangalore',
  },
  {
    code: 'VIDP',
    name: 'Station Two Name',
    city: 'City Two',
  },
  {
    code: 'VABB',
    name: 'Station Three Name',
    city: 'City Three',
  },
];

export const reviewPanelMenuContent = [
  {
    id: 1,
    title: 'View Question Banks',
    buttons: units,
  },
  {
    id: 2,
    title: 'View all Comments and Feedbacks',
    buttons: units,
  },
  {
    id: 3,
    title: 'Create Question',
    buttons: units,
  },
];

export const examinerMenuContent = [
  {
    id: 1,
    title: 'Generate Question Paper',
    buttons: units,
  },
  {
    id: 2,
    title: 'View Question Bank',
    buttons: units,
  },
];

export const trgInchargeMenuContent = [
  {
    id: 1,
    title: 'Question Banks',
    buttons: units,
  },
  {
    id: 2,
    title: 'Review Panel',
    buttons: units,
  },
  {
    id: 3,
    title: 'Question Papers',
    buttons: units,
  },
];

export const trgInchargeMenuContentCopy = [
  {
    key: 'qb',
    label: 'View Question Banks',
    children: [units[0].label, units[1].id],
  },
  {
    key: 'rp',
    label: 'Create Review Panel',
    children: [units[0].label, units[1].id],
  },
  {
    key: 'qp',
    label: 'Assign Examiner to prepare Question Paper',
    children: [units[0].label, units[1].id],
  },
];

export const trgInchargeAccordionTitles = [
  'View Question Banks',
  'View Question Papers',
  'Create Review Panel',
  'Assign Examiner to prepare Question Paper',
];
