import React, { Component } from 'react'
import { connect } from 'react-redux'
import { joinedMeeting, stoppedMeeting } from '../actions/Meeting'

class Meeting extends Component {

  // @todo temporary workaround https://phabricator.babeljs.io/T6656
  constructor(props) {
    super(props);
  }

  send = command => {
    if (!this.ws) {
      return;
    }
    this.ws.send(JSON.stringify({"command": command}));
  };

  handleMessage = event => {
    const data = JSON.parse(event.data);
    console.log(data);
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
  }
  render() {
    console.log(this.props);
    return (
      <div>
        Meeting {this.props.params.meetingId}
        <table>
          <tbody>
            <tr><td>meeting.id</td><td>{this.props.meeting.id}</td></tr>
            <tr><td>started</td><td>{this.props.started}</td></tr>
            <tr><td>name</td><td>{this.props.meeting.name}</td></tr>
            <tr><td>startTime</td><td>{this.props.meeting.startTime}</td></tr>
            <tr><td>participants</td><td>{this.props.meeting.participants}</td></tr>
            <tr><td>hourlyRate</td><td>{this.props.meeting.hourlyRate}</td></tr>
            <tr><td>timeElapsed</td><td>{this.props.timeElapsed}</td></tr>
          </tbody>
        </table>
      </div>
    )
  }
}

function mapStateToProps(state) {
  console.log(state);
  return {meeting: state.meeting };
}

export const MeetingContainer = connect(mapStateToProps)(Meeting);
