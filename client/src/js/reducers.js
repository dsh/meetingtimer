import { combineReducers } from 'redux'
import {reducer as formReducer} from 'redux-form'
import { routeReducer } from 'redux-simple-router'
import {JOINED_MEETING, STOPPED_MEETING, STOP_MEETING, MEETING_TICK, timeElapsed} from './actions/Meeting'

export const defaultMeetingState = {
  id: null,
  name: null,
  startTime: null,
  participants: null,
  hourlyRate: null,
  stopTime: null,
  timeElapsed: 0
};
function meeting(state = defaultMeetingState, action) {
  switch (action.type) {
    case JOINED_MEETING:
      return Object.assign({},
        action.payload,
        {timeElapsed: timeElapsed(action.payload.startTime)}
      );
    case MEETING_TICK:
      return Object.assign({}, state, {timeElapsed: action.payload});
    case STOPPED_MEETING:
      return Object.assign({}, state, {timeElapsed: action.payload.stopTime - action.payload.startTime});
    default:
      return state;
  }
}

export const defaultUiState = {
  inProgress: true,
  stopping: false
};
function ui(state = defaultUiState, action) {

  switch (action.type) {
    case JOINED_MEETING:
      return Object.assign({}, state, {inProgress: action.payload.stopTime === null});
    case STOP_MEETING:
      return Object.assign({}, state, {stopping: true});
    case STOPPED_MEETING:
      return Object.assign({}, state, {inProgress: false, stopping: false});
    default:
      return state;
  }
}


const rootReducer = combineReducers({
  meeting,
  ui,
  form: formReducer,
  routing: routeReducer
});

export default rootReducer;
