import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import StartNewMeetingLink from './StartNewMeetingLink'
require('./MeetingStatusMessage.less');

export default class MeetingStatusMessage extends Component {
  render() {
    const { message, showStartNew } = this.props;
    return (
      <div className="meeting-status-message-wrapper">
        <div className="meeting-status-message">{message}</div>
        {showStartNew && <StartNewMeetingLink />}
      </div>
    );
  }
}

MeetingStatusMessage.propTypes =  {
  message: PropTypes.string.isRequired,
  showStartNew: PropTypes.bool
};
