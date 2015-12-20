import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createAction } from 'redux-actions'
import { heartbeatIntervalMs } from '../constants'
import { STOP_MEETING, JOIN_MEETING, JOINED_MEETING, STOPPED_MEETING,
  joinedMeeting, joinMeeting, stoppedMeeting } from '../actions'
import ReconnectingWebSocket from '../lib/reconnecting-websocket'
const HEARTBEAT = 'HEARTBEAT';

class MeetingSocketComponent extends Component {

  send = type => {
    if (!this.ws) {
      return;
    }
    this.ws.send(createAction(type)());
  };


  // @todo use redux-action handleActions https://github.com/acdlite/redux-actions
  // or matchDispatchToProps in connect()? https://github.com/rackt/react-redux/blob/master/docs/api.md
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
    // @todo need error and close hanlders
    // @todo need retry open when closed unexpectedly
    const websSocketUrl = "/meeting-socket/" + this.props.meetingId;
    this.ws = new ReconnectingWebSocket("ws://" + location.hostname + ':9000' + websSocketUrl);
    this.ws.onmessage = this.handleMessage;
    this.ws.onopen = () => {
      console.log("open");
      this.send(JOIN_MEETING);
      // @todo do I need to dispatch this?
      this.props.dispatch(joinMeeting());
      this.startHeartbeat();
    };
    this.ws.onclose = this.stopHeartbeat;
  }

  // @TODO LOOK FOR stopping change
  // @todo move to RxJs for this... http://stackoverflow.com/a/31312139/895588
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

  // @todo can I render nothing?
  render = () => <div></div>
}

MeetingSocketComponent.propTypes =  {
  meetingId: PropTypes.string.isRequired,
  // @todo needed for compomentWillReceiveProps ... I don't like this at all
  stopping: PropTypes.bool.isRequired
};


const MeetingSocket = connect()(MeetingSocketComponent);
export default MeetingSocket;
