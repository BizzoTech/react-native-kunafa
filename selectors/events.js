import {
  createSelector
} from 'reselect';
import R from 'ramda';

const eventsSelector = state => state.events;

const interestingEventsSelector = createSelector(
  eventsSelector, events => {
    return R.values(events).filter(event => event.relevantDocsIds && event.relevantDocsIds.length > 0);
  }
)

const sortedEventsSelector = createSelector(
  interestingEventsSelector, events => {
    return R.sort((e1, e2) => e1.createdAt - e2.createdAt, R.values(events));
  }
)

export const eventsByRelevantDocSelector = createSelector(
  sortedEventsSelector, (events) => {
    const eventsWithDocIds = R.flatten(events.map(event => {
      return event.relevantDocsIds.map(docId => {return {...event, docId}});
    }));
    const eventsGroupedByDocId = R.groupBy(event => event.docId, eventsWithDocIds);
    return R.map(events => {
      return events.filter(event => !R.path(['action', 'appliedOnClient', event.docId], event));
    }, eventsGroupedByDocId);
  }
)
