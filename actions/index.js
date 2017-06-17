import * as authActions from './auth';
import * as historyActions from './history';
import * as dialogActions from './dialog';
import * as documentsActions from './documents';

export default {
  ...authActions,
  ...historyActions,
	...dialogActions,
  ...documentsActions
}
