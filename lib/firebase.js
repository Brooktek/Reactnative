const db = {
  collection: () => ({
    add: (data) => Promise.resolve({ id: 'mock-id-' + Date.now() })
  })
};

const collection = (db, name) => ({
  add: (data) => {
    console.log('Mock saving to collection:', name, data);
    return Promise.resolve({ id: 'mock-id-' + Date.now() });
  }
});

const addDoc = async (collectionRef, data) => {
  console.log('Mock saving document:', data);
  return { id: 'mock-id-' + Date.now() };
};

const Timestamp = {
  now: () => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 })
};

export { db, collection, addDoc, Timestamp };