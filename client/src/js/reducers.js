import { combineReducers } from 'redux'
import {reducer as formReducer} from 'redux-form'
import { routeReducer } from 'redux-simple-router'
import { START_MEETING } from './actions/NewMeeting'
import { JOIN_MEETING, JOINED_MEETING, STOPPED_MEETING, STOP_MEETING, MEETING_TICK } from './actions/Meeting'
// @todo I don't like this utility function inside a component
import { timeElapsed } from './containers/TimeTicker'


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
  console.log(action);
  switch (action.type) {
    case START_MEETING:
    case JOINED_MEETING:
      return Object.assign({},
        action.payload,
        {timeElapsed: timeElapsed(action.payload.startTime)}
      );
    case MEETING_TICK:
      return Object.assign({}, state, {timeElapsed: action.payload});
    case STOPPED_MEETING:
      // stopTime can be null if meeting never started. Don't allow negative times.
      return Object.assign({}, action.payload, {timeElapsed: Math.max(0, action.payload.stopTime - action.payload.startTime)});
    default:
      return state;
  }
}

export const defaultUiState = {
  joining: true,
  inProgress: false,
  stopping: false
};
function ui(state = defaultUiState, action) {

  switch (action.type) {
    case START_MEETING:
    case JOIN_MEETING:
      return Object.assign({}, state, {joining: true, inProgress: false});
    case JOINED_MEETING:
      return Object.assign({}, state, {joining: false, inProgress: action.payload.stopTime === null});
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
