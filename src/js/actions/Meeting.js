import { createAction } from 'redux-actions';

export const JOINED_MEETING = "JOINED_MEETING";
export const STOPPED_MEETING = "STOPPED_MEETING";

export const joinedMeeting = createAction(JOINED_MEETING);
export const stoppedMeeting = createAction(STOPPED_MEETING);
