import createCurrentProfileReducer from './currentProfile';
import createHistoryReducer from './history';
import events from './events';
import createDocumentsReducer from './documents';
import processing_local from './processing_local';
import dialog from './dialog';
import docLoaders from './docLoaders';


export default config => {
  const currentProfile = createCurrentProfileReducer(config.profileId);
  const history = createHistoryReducer(config.profileId);
  const documents = createDocumentsReducer(config.actionHandlers, config.getRelevantDocsIds);
  return {
    currentProfile,
    history,
    events,
		documents,
		processing_local,
    dialog,
    docLoaders
  }
}
