import kunafaActions from 'kunafa-client/actions';

import * as authActions from './auth';
import documentsActions from './documents';

export default {
  ...kunafaActions,
  ...authActions,
  ...documentsActions
}
