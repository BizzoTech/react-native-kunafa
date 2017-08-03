import createReducers from 'kunafa-client/reducers';

export default config => {
  const kunafaReducers = createReducers(config);
  return {
    ...kunafaReducers
  }
}
