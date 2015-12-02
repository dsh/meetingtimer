import { combineReducers } from 'redux'
import {reducer as formReducer} from 'redux-form'
import { routeReducer } from 'redux-simple-router'
import {JOINED_MEETING, STOPPED_MEETING} from './actions/Meeting'

export const defaultMeetingState = {
  id: null,
  name: null,
  startTime: null,
  participants: null,
  hourlyRate: null
};
function meeting(state = defaultMeetingState, action) {
  switch (action.type) {
    case JOINED_MEETING:
      return action.payload;
    default:
      return state;
  }

}

const rootReducer = combineReducers({
  meeting,
  form: formReducer,
  routing: routeReducer
});

export default rootReducer;
