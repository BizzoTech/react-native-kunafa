import uuid from 'uuid';
import {
  InteractionManager
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import R from 'ramda';

import {
  eventsByRelevantDocSelector
} from '../selectors/events';

//import {eventsByRelevantDocSelector} from '../custom_modules/react-native-kunafa/selectors/events';


const info = {
  device_unique_id: DeviceInfo.getUniqueID(),
  manufacturer: DeviceInfo.getManufacturer(),
  brand: DeviceInfo.getBrand(),
  model: DeviceInfo.getModel(),
  device_id: DeviceInfo.getDeviceId(),
  sys_name: DeviceInfo.getSystemName(),
  sys_version: DeviceInfo.getSystemVersion(),
  bundle_id: DeviceInfo.getBundleId(),
  build_number: DeviceInfo.getBuildNumber(),
  app_version: DeviceInfo.getVersion(),
  app_readable_version: DeviceInfo.getReadableVersion(),
  //device_name: DeviceInfo.getDeviceName(),
  user_agent: DeviceInfo.getUserAgent(),
  locale: DeviceInfo.getDeviceLocale(),
  country: DeviceInfo.getDeviceCountry(),
  timezone: DeviceInfo.getTimezone(),
  emulator: DeviceInfo.isEmulator()
}

export default (localOnlyActions, needLocalProcessing, getActionPreProcessors, getActionPostProcessors, getRelevantDocsIds) => {
  const createClientAction = (action, state) => {
    const eventsList = R.values(state.events);
    const events_size = eventsList.length;

    const localOnlyEvents = eventsList.filter(R.prop('localOnly'));
    const localProcessingDocumentsIds = R.flatten(localOnlyEvents.map(event => event.relevantDocsIds));
    const relevantDocsIds = getRelevantDocsIds(action);
    const shouldWaitForOtherAction = relevantDocsIds.some(docId => localProcessingDocumentsIds.includes(docId));

    const localOnly = needLocalProcessing(action) || shouldWaitForOtherAction;
    const _id = state.currentProfile._id ? `${state.currentProfile._id}-${Date.now()}-${action.type}` : `anonymous-${info.device_unique_id}-${Date.now()}-${action.type}`;
    return {
      _id,
      type: "EVENT",
      draft: "true",
      localOnly: localOnly ? "true" : undefined,
      action,
      relevantDocsIds: getRelevantDocsIds(action),
      preProcessors: getActionPreProcessors(action),
      postProcessors: getActionPostProcessors(action),
      status: "draft",
      info,
      createdAt: Date.now(),
      createdBy: (state.currentProfile._id || "anonymous")
    }
  }

  return store => next => action => {

    if (!localOnlyActions.includes(action.type)) {
      InteractionManager.runAfterInteractions(() => {
        next({
          type: 'ADD_EVENT',
          doc: createClientAction(action, store.getState())
        });
      });
    }

    let result = next(action);

    if (action.type === 'LOAD_DOCS' || action.type === 'LOAD_DOCS_FROM_CACHE') {
      setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          const eventsByRelevantDoc = eventsByRelevantDocSelector(store.getState());
          action.docs.forEach(doc => {
            const docEvents = eventsByRelevantDoc[doc._id] || [];
            docEvents.forEach(event => {
              const isAppliedOn = event.appliedOn && event.appliedOn[doc._id];
              if (isAppliedOn && event.appliedOn[doc._id] <= doc._rev) {
                event.appliedOnClient = event.appliedOnClient || {};
                next({
                  type: 'UPDATE_EVENT',
                  doc: {
                    ...event,
                    draft: true,
                    appliedOnClient: {
                      ...(event.appliedOnClient),
                      [doc._id]: doc._rev
                    }
                  }
                });
              } else {
                next(event.action);
              }
            });
          });
        });
      }, 200);
    }

    return result;

  }
}
