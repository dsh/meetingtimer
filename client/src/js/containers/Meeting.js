import React, { Component, PropTypes } from 'react'
import Cost from '../components/Cost'
import { connect } from 'react-redux'
import { STOP_MEETING, JOIN_MEETING, JOINED_MEETING, STOPPED_MEETING, joinedMeeting, stoppedMeeting,
  joinMeeting, stopMeeting, closeMeeting, startNewMeeting } from '../actions/Meeting'
import { createAction } from 'redux-actions';
import { Link } from 'react-router'


class Meeting extends Component {

  // @todo temporary workaround https://phabricator.babeljs.io/T6656
  constructor(props) {
    super(props);
  }


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
    // from http://www.jacklmoore.com/notes/rounding-in-javascript/
    function round(value, decimals) {
      return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }
    var cost = round(
      this.props.meeting.participants
      * this.props.meeting.timeElapsed / (60*60)
      * this.props.meeting.hourlyRate
      , 2);
    return (
      <div>
        <table>
          <tbody>
            <tr><td>meeting.id</td><td>{this.props.meeting.id}</td></tr>
            <tr><td>name</td><td>{this.props.meeting.name}</td></tr>
            <tr><td>startTime</td><td>{this.props.meeting.startTime}</td></tr>
            <tr><td>participants</td><td>{this.props.meeting.participants}</td></tr>
            <tr><td>hourlyRate</td><td>{this.props.meeting.hourlyRate}</td></tr>
            <tr><td>timeElapsed</td><td>{this.props.meeting.timeElapsed}</td></tr>
            <tr><td>Cost</td><td><Cost cost={cost} /></td></tr>
          </tbody>
        </table>
        { this.props.ui.inProgress && ! this.props.ui.stopping &&
          <button onClick={this.handleStopMeeting}>Stop</button>
        }
        { ! this.props.ui.inProgress && ! this.props.ui.stopping &&
          <Link to="/">start a new meeting</Link>
        }
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
