import { createAction } from 'redux-actions';

export const JOIN_MEETING = "JOIN_MEETING";
export const START_MEETING = "START_MEETING";

export const joinMeeting = createAction(JOIN_MEETING, meetingId => meetingId);
export const startMeeting = createAction(START_MEETING);
