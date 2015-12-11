import { createAction } from 'redux-actions';

export const JOINED_MEETING = "JOINED_MEETING";
export const STOPPED_MEETING = "STOPPED_MEETING";
export const STOP_MEETING = "STOP_MEETING";
export const MEETING_TICK = "MEETING_TICK";
// close == stopping or navigating away from a meeting
export const CLOSE_MEETING = "CLOSE_MEETING";


export function timeElapsed(startTime) {
  // @todo does this handle time zones correctly?
  // if start time is in the future, timeElapsed is 0
  return Math.max(0, Math.round(new Date().getTime() / 1000) - startTime);
}

// this seems very ugly
var interval;
function startTimer(startTime) {
}
function stopTimer() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
const meetingTick = createAction(MEETING_TICK, timeElapsed => timeElapsed);


const joined = createAction(JOINED_MEETING, payload => payload );
export function joinedMeeting(payload) {
  return dispatch => {
    // no stop time means the meeting is ongoing. Start the ticks.
    if (payload.stopTime === null) {
      interval = setInterval(function () {
        dispatch(meetingTick(timeElapsed(payload.meeting.startTime)));
      }, 1000);
    }
    dispatch(joined(payload));
  }
}

const stopped = createAction(STOPPED_MEETING, timeElapsed => timeElapsed);
export const stoppedMeeting = function(timeElapsed) {
  return dispatch => {
    stopTimer();
    dispatch(stopped(timeElapsed));
  }
}

const stop = createAction(STOP_MEETING);
export function stopMeeting() {
  return dispatch => {
    stopTimer();
    dispatch(stop());
  }
}

// @todo don't manually call .. subscribe to UI state changes?
const close = createAction(CLOSE_MEETING);
export function closeMeeting() {
  return dispatch => {
    stopTimer();
    dispatch(close());
  }
}