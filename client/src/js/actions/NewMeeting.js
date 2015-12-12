import fetch from 'isomorphic-fetch'
import { createAction } from 'redux-actions'
import { updatePath } from 'redux-simple-router'

var moment = require('moment'); // no es6 import
require('frozen-moment');


export const START_MEETING = "START_MEETING";
export const START_MEETING_REQUEST = "START_MEETING_REQUEST";


const start = createAction(START_MEETING, meeting => meeting);


export function joinMeeting(meeting) {
  return dispatch => {
    dispatch(updatePath("/m/" + meeting.id));
  }
}

function startMeetingRequest(meeting) {
  return dispatch => {
    dispatch(start(meeting));
    // @todo see https://github.com/github/fetch to add error handling
    return fetch('http://' + location.hostname + ':9000/start', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meeting)
    })
      .then(req => req.json())
      .then(meeting => dispatch(joinMeeting(meeting)))
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

      const timeFormats = ["h:m a", "h:ma", "H:m"];
      let time = moment(timeString, timeFormats);
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
      meetingData,
      {startTime: convertPastTime(meetingData.startTime).format("X")}
    );

  }

  return dispatch => {
    return dispatch(startMeetingRequest(meetingDataToMeeting(meetingData)));
  }
}
