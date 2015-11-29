import fetch from 'isomorphic-fetch'
import { createAction } from 'redux-actions';
import { updatePath } from 'redux-simple-router'


export const JOIN_MEETING = "JOIN_MEETING";
export const START_MEETING = "START_MEETING";
export const START_MEETING_REQUEST = "START_MEETING_REQUEST";

const join = createAction(JOIN_MEETING, meetingId => meetingId);
const start = createAction(START_MEETING, meeting => meeting);


export function joinMeeting(meetingId) {
  return dispatch => {
    dispatch(join(meetingId));
    dispatch(updatePath("/m/" + meetingId));
  }
}

function startMeetingRequest(meeting) {
  return dispatch => {
    dispatch(start(meeting));
    // @todo see https://github.com/github/fetch to add error handling
    return fetch('/start', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meeting)
    })
      .then(req => req.json())
      .then(meetingId => dispatch(joinMeeting(meetingId)))
  }
}

export function startMeeting(meeting) {
  return (dispatch, getState) => {
    return dispatch(startMeetingRequest(meeting))
  }
}
