import { combineReducers } from 'redux'
import {reducer as formReducer} from 'redux-form'

/* import {
  SELECT_REDDIT, INVALIDATE_REDDIT,
  REQUEST_POSTS, RECEIVE_POSTS
} from './actions'
*/

const myReducer = (state = {}, action) => state;

const rootReducer = combineReducers({
  myReducer,
  form: formReducer
});

export default rootReducer;
