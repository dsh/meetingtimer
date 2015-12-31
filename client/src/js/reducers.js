import { combineReducers } from 'redux'
import {reducer as formReducer} from 'redux-form'
import {  handleActions } from 'redux-actions'
import { routeReducer } from 'redux-simple-router'
import { copyToClipboardDefaultText } from './constants'
import { CLEAR_MEETING, START_MEETING, JOIN_MEETING, JOINED_MEETING, STOPPED_MEETING, STOP_MEETING, MEETING_TICK, ERROR,
  CLEAR_ERROR, CLEAR_SUBMIT_ERROR, COPY_TO_CLIPBOARD } from './actions'
import timeElapsed from './lib/timeElapsed'
const trim = require('lodash/string/trim');
const isString = require('lodash/lang/isString');


const startOrJoinMeeting = (state, action) => ({
  ...action.payload,
  timeElapsed: timeElapsed(action.payload.startTime)
});
const meetingDefaultState = {
  id: null,
  name: null,
  startTime: null,
  participants: null,
  hourlyRate: null,
  stopTime: null,
  timeElapsed: 0,
  isOwner: false
};
const meeting = handleActions({
  CLEAR_MEETING: (state, action) => meetingDefaultState,
  START_MEETING: (state, action) =>
    ({...state, ...action.payload, timeElapsed: timeElapsed(action.payload.startTime), stopTime: null, isOwner: false}),
  JOINED_MEETING: (state, action) => {
    function isOwner(owner) {
      const userId = document.cookie.replace(/.*userId=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/, "$1");
      return userId == owner;
    }
    const meeting = action.payload;
    return {...state, ...meeting, timeElapsed: timeElapsed(meeting.startTime), isOwner: isOwner(meeting.owner)};
  },
  MEETING_TICK: (state, action) => ({...state, timeElapsed: action.payload}),
  STOPPED_MEETING: (state, action) => ({
    ...action.payload,
    timeElapsed: Math.max(0, action.payload.stopTime - action.payload.startTime)
  })
}, meetingDefaultState);

const uiDefaultState = {
  starting: false,
  joining: true,
  inProgress: false,
  stopping: false,
  error: null,
  copyToClipboardText: copyToClipboardDefaultText
};
const ui = handleActions({
  START_MEETING: (state, action) =>
    ({...state, starting: true, joining: true,  stopping: false, inProgress: false, error: null}),
  JOIN_MEETING: (state, action) =>
    ({...state, starting: false, joining: true,  stopping: false, inProgress: false}),
  JOINED_MEETING: (state, action) => ({
    ...state, starting: false, joining: false, stopping: false,
    inProgress: action.payload.stopTime === null,
    error: null
  }),
  STOP_MEETING: (state, action) =>
    ({...state, starting: false, joining: false, stopping: true, inProgress: true}),
  STOPPED_MEETING: (state, action) =>
    ({...state, starting: false, joining: false, stopping: false, inProgress: false, error: null}),
  ERROR: (state, action) => {
    const { actionType, message } = action.payload;
    function actionTypeToUiState(at) {
      switch (at) {
        case STOP_MEETING:
          return {stopping: false};
        case JOIN_MEETING:
          return {joining: false};
      }
      // Unknown error cause. Reset everything.
      return uiDefaultState;
    }
    return {...state, ...actionTypeToUiState(actionType), error: isString(message) ? message : "Unknown error."};
  },
  CLEAR_ERROR: (state, action) => ({...state, error: null}),
  COPY_TO_CLIPBOARD: (state, action) => ({...state, copyToClipboardText: action.payload})
}, uiDefaultState);

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


const rootReducer = combineReducers({
  meeting,
  ui,
  form: form,
  routing: routeReducer
});

export default rootReducer;
