import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { joinedMeeting, stoppedMeeting, stopMeeting, closeMeeting } from '../actions/Meeting'

class Meeting extends Component {

  // @todo temporary workaround https://phabricator.babeljs.io/T6656
  constructor(props) {
    super(props);
  }


  handleStopMeeting = () => {
    this.send("stop");
    this.props.dispatch(stopMeeting());
  };

  send = command => {
    if (!this.ws) {
      return;
    }
    this.ws.send(JSON.stringify({"command": command}));
  };

  handleMessage = event => {
    const data = JSON.parse(event.data);
    switch (data.event) {
      case "joined":
        this.props.dispatch(joinedMeeting(data.meeting));
        break;
      case "stopped":
        this.props.dispatch(stoppedMeeting(data.timeElapsed));
        break;
    }
  };

  componentWillMount() {
    // @todo need to move this websocket logic into it's own business logic compoennt
    // @todo need error and close hanlders
    // @todo need retry open when closed unexpectedly
    var websSocketUrl = "/meeting-socket/" + this.props.params.meetingId;
    this.ws = new WebSocket("ws://" + location.hostname + ':' + location.port + websSocketUrl);
    this.ws.onmessage = this.handleMessage;
    this.ws.onopen = () => this.send("join");
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
        Meeting {this.props.params.meetingId}
        <table>
          <tbody>
            <tr><td>meeting.id</td><td>{this.props.meeting.id}</td></tr>
            <tr><td>name</td><td>{this.props.meeting.name}</td></tr>
            <tr><td>startTime</td><td>{this.props.meeting.startTime}</td></tr>
            <tr><td>participants</td><td>{this.props.meeting.participants}</td></tr>
            <tr><td>hourlyRate</td><td>{this.props.meeting.hourlyRate}</td></tr>
            <tr><td>timeElapsed</td><td>{this.props.meeting.timeElapsed}</td></tr>
            <tr><td>Cost</td><td>{cost}</td></tr>
          </tbody>
        </table>
        { this.props.ui.inProgress && ! this.props.ui.stopping &&
          <button onClick={this.handleStopMeeting}>Stop</button>
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
