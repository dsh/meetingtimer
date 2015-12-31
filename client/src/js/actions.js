import { createAction } from 'redux-actions';
import fetch from 'isomorphic-fetch'
import { updatePath } from 'redux-simple-router'
import { validTimeFormats } from './constants'
import normalizeMeeting from './lib/normalizeMeeting'
import { copyToClipboardDefaultText } from './constants'
const trim = require('lodash/string/trim');
const moment = require('moment');
require('frozen-moment');

export const JOINED_MEETING = "JOINED_MEETING";
export const STOPPED_MEETING = "STOPPED_MEETING";
export const JOIN_MEETING = "JOIN_MEETING";
export const STOP_MEETING = "STOP_MEETING";
export const MEETING_TICK = "MEETING_TICK";
export const CLEAR_MEETING = "CLEAR_MEETING";
export const START_MEETING = "START_MEETING";
export const START_MEETING_REQUEST = "START_MEETING_REQUEST";
export const ERROR = "ERROR";
export const CLEAR_ERROR = "CLEAR_ERROR";
export const CLEAR_SUBMIT_ERROR = "CLEAR_SUBMIT_ERROR";
export const COPY_TO_CLIPBOARD = "COPY_TO_CLIPBOARD";

export const clearMeeting = createAction(CLEAR_MEETING);
export const joinedMeeting = createAction(JOINED_MEETING, meeting => meeting );
export const stoppedMeeting = createAction(STOPPED_MEETING, meeting => meeting);
export const stopMeeting = createAction(STOP_MEETING);
export const meetingTick = createAction(MEETING_TICK, timeElapsed => timeElapsed);
export function errorAction(message, actionType) {
  return dispatch => {
    if (actionType == JOIN_MEETING) {
      // errors on join meeting, navigate to home page.
      // If we don't do this, the meeting socket continually tries to reload.
      dispatch(updatePath('/'));
    }
    dispatch(createAction(ERROR)({actionType: actionType, message: message}));
  }
}
export const clearErrorAction  = createAction(CLEAR_ERROR);
export const clearSubmitError = createAction(CLEAR_SUBMIT_ERROR);
// Changes the copy to clipboard text to "Copied!" for two seconds before returning it to it's original text.
export const copyToClipboard = createAction(
  COPY_TO_CLIPBOARD,
  () => "Copied!",
  () => ({
    // A few seconds after showing copied, change message copy tooltip back to the default.
    delayedDispatch: {
      delay: 2000,
      action: createAction(COPY_TO_CLIPBOARD)(copyToClipboardDefaultText)
    }
  })
);



export function joinMeeting(meetingId)  {
  console.log("joinMeeting " + meetingId)
  return dispatch => {
    dispatch(clearMeeting()); // clear out any existing meeting
    dispatch(navigateToMeeting(meetingId));
  }
}

function navigateToMeeting(meetingId) {
  console.log("navigateToMeeting " + meetingId);
  return dispatch => {
    dispatch(createAction(JOIN_MEETING)());
    dispatch(updatePath("/m/" + trim(meetingId).toUpperCase()));
  }
}

function startMeetingRequest(meeting) {
  return dispatch => {
    // from https://github.com/github/fetch
    function checkStatus(response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        return response.text()
          .then(errorMessage => {
            var error = new Error(errorMessage ? errorMessage : response.statusText);
            error.response = response;
            throw error;
          });
      }
    }

    dispatch(clearMeeting()); // clear out any existing meeting
    dispatch(createAction(START_MEETING)(meeting));
    return fetch(location.origin + '/start', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // need credentials because start will set the userId cookie for us
      credentials: 'same-origin',
      body: JSON.stringify(meeting)
    })
      .then(checkStatus)
      .then(req => req.json())
      .then(meeting => dispatch(navigateToMeeting(meeting.id)))
      .catch(error => dispatch(errorAction(error, START_MEETING)));
  }
}

/**
 * Takes validated but unparsed data from the start meeting form.
 */
export function startMeeting(meetingData) {
  function meetingDataToMeeting(meetingData) {
    // We only require user to give us a time. If it appears to be in the past few hours we'll use a date
    // in the past. This allows us to start a meeting timer for a meeting already in progress.
    function convertPastTime(timeString) {
      const now = moment().freeze();
      const hoursToLookBack = 8;
      // anything less than this will be considered the future
      const futureThreshold = now.subtract(hoursToLookBack, 'hours');
      // anything greater than this will be considered the past
      const pastThreshold = now.add(24 - hoursToLookBack, 'hours');

      let time = moment(timeString, validTimeFormats);
      if (time.isBefore(futureThreshold)) {
        return time.add(1, 'day');
      }
      if (time.isAfter(pastThreshold)) {
        return time.subtract(1, 'day');
      }
      return time;
    }
    return Object.assign(
      {},
      normalizeMeeting(meetingData),
      {startTime: Number(convertPastTime(meetingData.startTime).format("X"))}
    );

  }

  return dispatch => {
    return dispatch(startMeetingRequest(meetingDataToMeeting(meetingData)));
  }
}
