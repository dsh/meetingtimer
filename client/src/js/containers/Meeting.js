import React, { Component, PropTypes } from 'react'
import Cost from '../components/Cost'
import TimeElapsed from '../components/TimeElapsed'
import CopyToClipboard from 'react-copy-to-clipboard'
import { connect } from 'react-redux'
import { STOP_MEETING, JOIN_MEETING, JOINED_MEETING, STOPPED_MEETING, joinedMeeting, stoppedMeeting,
  joinMeeting, stopMeeting, closeMeeting } from '../actions/Meeting'
import { createAction } from 'redux-actions';
import { Link } from 'react-router'
const moment = require('moment');
require('./Meeting.less');

class Meeting extends Component {

  handleStopMeeting = () => {
    this.send(STOP_MEETING);
    this.props.dispatch(stopMeeting());
  };

  // the entire websocket might be better in the middlewhare inside the Meeting actions?
  send = type => {
    if (!this.ws) {
      return;
    }
    // @todo use createAction?
    this.ws.send(JSON.stringify(createAction(type)()));
  };

  // @todo use redux-action handleActions https://github.com/acdlite/redux-actions
  handleMessage = event => {
    const data = JSON.parse(event.data);
    // @todo No switch, just dispatch directly. the events from the server are already FSA format.
    // But then how to have the actionCreator side effects?
    switch (data.type) {
      case JOINED_MEETING:
        this.props.dispatch(joinedMeeting(data.payload));
        break;
      case STOPPED_MEETING:
        this.props.dispatch(stoppedMeeting(data.payload));
        break;
    }
  };

  componentWillMount() {
    // @todo need to move this websocket logic into it's own business logic compoennt
    // @todo need error and close hanlders
    // @todo need retry open when closed unexpectedly
    var websSocketUrl = "/meeting-socket/" + this.props.params.meetingId;
    this.ws = new WebSocket("ws://" + location.hostname + ':9000' + websSocketUrl);
    this.ws.onmessage = this.handleMessage;
    this.ws.onopen = () => {
      this.send(JOIN_MEETING);
      this.props.dispatch(joinMeeting());
    }
  }
  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    // @todo don't manually call .. subscribe to UI state changes elsewhere?
    this.props.dispatch(closeMeeting());
  }
  render() {
    const startNew = <Link className="btn" to="/">start a new meeting</Link>;
    if (this.props.ui.joining) {
      return (
        <div className="joining-meeting-container">
          <div className="joining-meeting">Joining meeting...</div>
          {startNew}
        </div>
      );
    }
    const cost =
      this.props.meeting.participants
      * this.props.meeting.timeElapsed / (60*60)
      * this.props.meeting.hourlyRate;
    // @todo ShareMeeting to different component
    // @todo url builder for the meeting link. We use it in navigate, too.
    const meetingPath = "/m/" + this.props.meeting.id;
    const meetingUrl = "http://meetingtimer.io" + meetingPath;

    console.log(this.props.meeting);
    var meetingTime = "";
    if (!this.props.ui.inProgress) {
      if (this.props.meeting.endTime) {
        meetingTime = "Meeting ended at " + moment(this.props.meeting.endTime * 1000).format("h:mm A") + ".";
      }
    } else {
      const now = moment();
      const startTime = moment(this.props.meeting.startTime * 1000);
      const startTimeFormatted = startTime.format("h:mm A");
      if (startTime.isBefore(now)) {
        meetingTime = "Meeting starting at " + startTimeFormatted + ".";
      }
      else {
        meetingTime = "Meeting started at " + startTimeFormatted + ".";
      }
    }
    return (
      <div className="meeting-container">
        <div className="meeting-info">
          <div className="meeting-name">{this.props.meeting.name}</div>
          <div className="meeting-time">{meetingTime}</div>
          <TimeElapsed seconds={this.props.meeting.timeElapsed} />
          <Cost cost={cost} />
          <div className="meeting-controls">
            { this.props.ui.inProgress && ! this.props.ui.stopping &&
              <button onClick={this.handleStopMeeting}>Stop</button>
            }
            { ! this.props.ui.inProgress && ! this.props.ui.stopping &&
              startNew
            }
          </div>
        </div>
        <div className="share-meeting">
          Meeting ID: <span className="meeting-id">{this.props.meeting.id}</span><br />
          <Link className="meeting-link" to={meetingPath}>{meetingUrl}</Link>&nbsp;
          <CopyToClipboard text={meetingUrl}>
            <span className="copy-to-clipboard">&#x279f;</span>
          </CopyToClipboard>
        </div>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    meeting: state.meeting,
    ui: state.ui
  };
}

export const MeetingContainer = connect(mapStateToProps)(Meeting);
