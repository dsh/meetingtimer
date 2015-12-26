import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createAction } from 'redux-actions'
import { heartbeatIntervalMs } from '../constants'
import { STOP_MEETING, JOIN_MEETING, JOINED_MEETING, STOPPED_MEETING, ERROR,
  joinedMeeting, joinMeeting, stoppedMeeting, errorAction } from '../actions'
import ReconnectingWebSocket from '../lib/reconnecting-websocket'
const HEARTBEAT = 'HEARTBEAT';

class MeetingSocketComponent extends Component {

  send = type => {
    if (!this.ws) {
      return;
    }
    this.ws.send(createAction(type)());
  };


  handleMessage = event => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case JOINED_MEETING:
        this.props.dispatch(joinedMeeting(data.payload));
        break;
      case STOPPED_MEETING:
        this.props.dispatch(stoppedMeeting(data.payload));
        break;
      case ERROR:
        this.props.dispatch(errorAction(data.payload));
        break;

    }
  };

  stopHeartbeat = () => {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  };

  startHeartbeat = () => {
    this.heartbeatInterval = setInterval(() => this.send(HEARTBEAT), heartbeatIntervalMs);
  };

  componentWillMount() {
    // Connect to web socket at port 9000 (Scala Play server port).
    // This handles if the original connection is to https, will use the wss server.
    const host = location.origin.replace(/^http/, "ws").replace(/:[\d]+$/, '') + ':9000';
    this.ws = new ReconnectingWebSocket(host + "/meeting-socket/" + this.props.meetingId);
    this.ws.onmessage = this.handleMessage;
    this.ws.onopen = () => {
      this.send(JOIN_MEETING);
      this.props.dispatch(joinMeeting());
      this.startHeartbeat();
    };
    this.ws.onclose = this.stopHeartbeat;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.stopping && nextProps.stopping) {
      this.send(STOP_MEETING);
    }
  }

  componentWillUnmount() {
    this.stopHeartbeat();
    if (this.ws && this.ws.readyState <= 1) {
      this.ws.close();
    }
  }

  render = () => <div></div>
}

MeetingSocketComponent.propTypes =  {
  meetingId: PropTypes.string.isRequired,
  stopping: PropTypes.bool.isRequired
};


const MeetingSocket = connect()(MeetingSocketComponent);
export default MeetingSocket;
