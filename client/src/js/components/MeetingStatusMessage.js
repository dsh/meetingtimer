import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import StartNewMeetingLink from './StartNewMeetingLink'
require('./MeetingStatusMessage.less');
require('../../stylesheets/throbber.css');

export default class MeetingStatusMessage extends Component {
  render() {
    const { message, showStartNew } = this.props;
    return (
      <div className="meeting-status-message-wrapper">
        <div className="meeting-status-message">{message}</div>
        <div className="throbber-loader"></div>
        {showStartNew && <div className="button-wrapper"><StartNewMeetingLink /></div>}
      </div>
    );
  }
}

MeetingStatusMessage.propTypes =  {
  message: PropTypes.string.isRequired,
  showStartNew: PropTypes.bool
};
