import { createAction } from 'redux-actions';
import fetch from 'isomorphic-fetch'
import { updatePath } from 'redux-simple-router'
import { validTimeFormats } from './constants'
import normalizeMeeting from './lib/normalizeMeeting'
const trim = require('lodash/string/trim');
const moment = require('moment');
require('frozen-moment');

export const JOINED_MEETING = "JOINED_MEETING";
export const STOPPED_MEETING = "STOPPED_MEETING";
export const JOIN_MEETING = "JOIN_MEETING";
export const STOP_MEETING = "STOP_MEETING";
export const MEETING_TICK = "MEETING_TICK";
export const START_MEETING = "START_MEETING";
export const START_MEETING_REQUEST = "START_MEETING_REQUEST";
export const ERROR = "ERROR";
export const CLEAR_SUBMIT_ERROR = "CLEAR_SUBMIT_ERROR";


export const joinedMeeting = createAction(JOINED_MEETING, meeting => meeting );
export const stoppedMeeting = createAction(STOPPED_MEETING, meeting => meeting);
export const joinMeeting = createAction(JOIN_MEETING);
export const stopMeeting = createAction(STOP_MEETING);
export const meetingTick = createAction(MEETING_TICK, timeElapsed => timeElapsed);
export const errorAction  = createAction(ERROR, error => error);
export const clearSubmitError = createAction(CLEAR_SUBMIT_ERROR);


export function navigateToMeeting(meetingId) {
  return dispatch => {
    dispatch(joinMeeting());
    dispatch(updatePath("/m/" + trim(meetingId).toUpperCase()));
  }
}

const start = createAction(START_MEETING, meeting => meeting);
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

    dispatch(start(meeting));
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
      .catch(error => dispatch(errorAction(error)));
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
