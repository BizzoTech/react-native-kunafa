import SimpleStore from 'react-native-simple-store';

export default {
  keys: SimpleStore.keys,
  get: SimpleStore.get,
  save: SimpleStore.save,
  delete: SimpleStore.delete,
  getAll: async() => {
    const keys = await SimpleStore.keys();
    const items = await SimpleStore.get(keys);
    return items;
  }
}
