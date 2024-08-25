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
