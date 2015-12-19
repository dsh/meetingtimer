import React, { Component } from 'react'
import { connect } from 'react-redux'
import { stopMeeting } from '../actions/Meeting'
import MeetingSocket from './MeetingSocket'
import TimeTicker from './TimeTicker'
import MeetingView from '../components/MeetingView'
import JoiningMeeting from '../components/JoiningMeeting'


class Meeting extends Component {

  // @todo probably use matchDispatchToProps in connect() https://github.com/rackt/react-redux/blob/master/docs/api.md
  handleStopMeeting = () => {
    this.props.dispatch(stopMeeting());
  };


  render() {
    const { meeting, ui } = this.props;
    return (
      <div>
        { !meeting.stopTime && <MeetingSocket meetingId={this.props.params.meetingId} stopping={ui.stopping} /> }
        { meeting.startTime && !meeting.stopTime && !ui.stopping && <TimeTicker startTime={meeting.startTime} /> }
        { ui.joining && <JoiningMeeting /> }
        { !ui.joining && <MeetingView onStopMeeting={this.handleStopMeeting} meeting={meeting} ui={ui} /> }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    meeting: state.meeting,
    ui: state.ui
  };
}
const MeetingContainer = connect(mapStateToProps)(Meeting);
export default MeetingContainer;
