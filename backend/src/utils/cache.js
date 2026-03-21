/**
 * Simple in-memory cache for Read-Only Fallback
 */
const cacheStore = new Map();

const set = (key, data) => {
  if (!data) return;
  // Deep clone to prevent accidental mutations
  cacheStore.set(key, JSON.parse(JSON.stringify(data)));
};

const get = (key) => {
  return cacheStore.get(key) || null;
};

const clear = () => {
  cacheStore.clear();
};

module.exports = {
  set,
  get,
  clear
};
