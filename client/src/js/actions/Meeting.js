import { createAction } from 'redux-actions';

export const JOINED_MEETING = "JOINED_MEETING";
export const STOPPED_MEETING = "STOPPED_MEETING";
export const JOIN_MEETING = "JOIN_MEETING";
export const STOP_MEETING = "STOP_MEETING";
export const MEETING_TICK = "MEETING_TICK";


export const joinedMeeting = createAction(JOINED_MEETING, meeting => meeting );
export const stoppedMeeting = createAction(STOPPED_MEETING, meeting => meeting);
export const joinMeeting = createAction(JOIN_MEETING);
export const stopMeeting = createAction(STOP_MEETING);
export const meetingTick = createAction(MEETING_TICK, timeElapsed => timeElapsed);
