// Function to remove uncloneable properties
export const removeUncloneableProperties = (item) => {
  const cloneableItem = { ...item };
  Object.keys(cloneableItem).forEach((key) => {
    if (typeof cloneableItem[key] === 'function') {
      cloneableItem[key] = cloneableItem[key]();
    }
  });
  return cloneableItem;
};

// export default function removeUncloneableProperties(obj: any): any {
//   const cleaned = { ...obj };

//   // Convert Date objects to ISO strings
//   Object.keys(cleaned).forEach((key) => {
//     if (cleaned[key] instanceof Date) {
//       cleaned[key] = cleaned[key].toISOString();
//     }
//   });

//   // Remove any functions or non-cloneable objects
//   Object.keys(cleaned).forEach((key) => {
//     if (typeof cleaned[key] === 'function') {
//       delete cleaned[key];
//     }
//   });

//   return cleaned;
// }
