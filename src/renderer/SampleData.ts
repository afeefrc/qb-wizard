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

