import React, { Component } from 'react'
import { Link } from 'react-router'
import StartNewMeetingLink from './StartNewMeetingLink'
require('./JoiningMeeting.less');

export default class JoiningMeeting extends Component {
  render() {
    return (
      <div className="joining-meeting-container">
        <div className="joining-meeting">Joining meeting...</div>
        <StartNewMeetingLink />
      </div>
    );
  }
}
