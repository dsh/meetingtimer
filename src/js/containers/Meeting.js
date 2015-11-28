import React, { Component } from 'react'
import { connect } from 'react-redux'

class Meeting extends Component {
  handleMessage(event) {
    console.log(event);
  }

  componentWillMount() {
    var websSocketUrl = "/meeting-socket/" + this.props.params.meetingId;
    this.ws = new WebSocket("ws://" + location.hostname + ':' + location.port + websSocketUrl);
    this.ws.onmessage = this.handleMessage;
  }
  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  render() {
    return (
      <div>
        Meeting {this.props.params.meetingId}
      </div>
    )
  }
}

export const MeetingContainer = connect()(Meeting);
