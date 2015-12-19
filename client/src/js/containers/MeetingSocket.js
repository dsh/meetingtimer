import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createAction } from 'redux-actions'
import { STOP_MEETING, JOIN_MEETING, JOINED_MEETING, STOPPED_MEETING,
  joinedMeeting, joinMeeting, stoppedMeeting } from '../actions/Meeting'


class MeetingSocketComponent extends Component {

  send = type => {
    if (!this.ws) {
      return;
    }
    // @todo use createAction?
    this.ws.send(JSON.stringify(createAction(type)()));
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

  componentWillMount() {
    // @todo need error and close hanlders
    // @todo need retry open when closed unexpectedly
    const websSocketUrl = "/meeting-socket/" + this.props.meetingId;
    this.ws = new WebSocket("ws://" + location.hostname + ':9000' + websSocketUrl);
    this.ws.onmessage = this.handleMessage;
    this.ws.onopen = () => {
      this.send(JOIN_MEETING);
      // @todo do I need to dispatch this?
      this.props.dispatch(joinMeeting());
    }
  }
  componentWillUnmount() {
    if (this.ws) {
      // @todo do I need to wait to receive the STOPPED message before closing, so I have the
      // actual stop time from the server?
      this.ws.close();
    }
  }

  // @todo can I render nothing?
  render = () => <div className="meeting-scoket"></div>
}

MeetingSocketComponent.propTypes =  {
  meetingId: PropTypes.string.isRequired
};


const MeetingSocket = connect()(MeetingSocketComponent);
export default MeetingSocket;
