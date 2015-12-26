import { combineReducers } from 'redux'
import {reducer as formReducer} from 'redux-form'
import {  handleActions } from 'redux-actions';
import { routeReducer } from 'redux-simple-router'
import { START_MEETING, JOIN_MEETING, JOINED_MEETING, STOPPED_MEETING, STOP_MEETING, MEETING_TICK, ERROR,
  CLEAR_SUBMIT_ERROR } from './actions'
import timeElapsed from './lib/timeElapsed'
const trim = require('lodash/string/trim');

const startOrJoinMeeting = (state, action) => ({
  ...action.payload,
  timeElapsed: timeElapsed(action.payload.startTime)
});
const meeting = handleActions({
  START_MEETING: startOrJoinMeeting,
  JOINED_MEETING: startOrJoinMeeting,
  MEETING_TICK: (state, action) => ({...state, timeElapsed: action.payload}),
  STOPPED_MEETING: (state, action) => ({
    ...action.payload,
    timeElapsed: Math.max(0, action.payload.stopTime - action.payload.startTime)
  })
}, {
  id: null,
  name: null,
  startTime: null,
  participants: null,
  hourlyRate: null,
  stopTime: null,
  timeElapsed: 0
});

const startOrJoinMeetingUi = (state, action) => ({...state, joining: true,  stopping: false, inProgress: false});
const ui = handleActions({
  START_MEETING: startOrJoinMeetingUi,
  JOIN_MEETING: startOrJoinMeetingUi,
  JOINED_MEETING: (state, action) => ({
    ...state, joining: false, stopping: false,
    inProgress: action.payload.stopTime === null
  }),
  STOP_MEETING: (state, action) => ({...state, joining: false, stopping: true, inProgress: true}),
  STOPPED_MEETING: (state, action) => ({...state, joining: false, stopping: false, inProgress: false}),
  ERROR: (state, action) => {
    const { actionType, message } = action.payload;
    function actionTypeToUiState(at) {
      switch (at) {
        case STOP_MEETING:
          return {stopping: false};
        case JOIN_MEETING:
          return {joining: false};
      }
      return {};
    }
    return {...state, ...actionTypeToUiState(actionType), error: message};
  }
},  {
  joining: true,
  inProgress: false,
  stopping: false,
  error: null
});

const form = formReducer.normalize({
  join_meeting: {
    meetingId: value => trim(value).toUpperCase()
  },
  start_meeting: {
    participants: value => value && value.replace(/[^\d]/g, ''),
    hourlyRate: value => value && value.replace(/[^\d\.]/g, '')
  }
}).plugin({
  join_meeting: (state, action) => {
    switch (action.type) {
      case CLEAR_SUBMIT_ERROR:
        return {
          ...state,
          _submitFailed: false
        };
      default:
        return state;
    }
  }
});


// @todo move these each to their own file, do an import of the entier reducers directory
const rootReducer = combineReducers({
  meeting,
  ui,
  form: form,
  routing: routeReducer
});

export default rootReducer;
