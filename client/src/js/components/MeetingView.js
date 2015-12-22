import React, { Component, PropTypes } from 'react'
import Cost from './Cost'
import TimeElapsed from './TimeElapsed'
import StartNewMeetingLink from './StartNewMeetingLink'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Link } from 'react-router'
import { meetingtimerBase } from '../constants'
const moment = require('moment');
require('./MeetingView.less');


export default class MeetingView extends Component {

  render() {
    const { meeting, ui } = this.props;
    const cost =
      meeting.participants
      * meeting.timeElapsed / (60 * 60)
      * meeting.hourlyRate;
    const meetingPath = "/m/" + meeting.id;
    const meetingUrl = meetingtimerBase + meetingPath;
    var meetingTime = "";
    if (!ui.inProgress) {
      if (meeting.stopTime) {
        meetingTime = "Meeting ended at " + moment(meeting.stopTime * 1000).format("h:mm A") + ".";
      }
      else {
        meetingTime = "Stopping meeting...";
      }
    } else {
      const now = moment();
      const startTime = moment(meeting.startTime * 1000);
      const startTimeFormatted = startTime.format("h:mm A");
      if (startTime.isBefore(now)) {
        meetingTime = "Meeting started at " + startTimeFormatted + ".";
      }
      else {
        meetingTime = "Meeting starting at " + startTimeFormatted + ".";
      }
    }
     return (
      <div className="meeting-wrapper">
        <div className="meeting-info">
          <div className="meeting-name">{meeting.name}</div>
          <div className="meeting-time">{meetingTime}</div>
          <TimeElapsed seconds={meeting.timeElapsed}/>
          <Cost cost={cost}/>
          <div className="meeting-controls">
            { ui.inProgress && !ui.stopping && <button onClick={this.props.onStopMeeting}>Stop</button> }
            { !ui.inProgress && <StartNewMeetingLink /> }
          </div>
        </div>
        <div className="share-meeting">
          Meeting ID: <span className="meeting-id">{meeting.id}</span><br />
          <Link className="meeting-link" to={meetingPath}>{meetingUrl}</Link>&nbsp;
          <CopyToClipboard text={meetingUrl}>
            <span className="copy-to-clipboard">&#x279f;</span>
          </CopyToClipboard>
        </div>
      </div>
    );
  }
}

MeetingView.propTypes =  {
  meeting: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  onStopMeeting: PropTypes.func.isRequired
};

