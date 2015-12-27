import React, { Component } from 'react'
import { connect } from 'react-redux'
import { stopMeeting } from '../actions'
import MeetingSocket from './MeetingSocket'
import TimeTicker from './TimeTicker'
import MeetingView from '../components/MeetingView'
import MeetingStatusMessage from '../components/MeetingStatusMessage'


class Meeting extends Component {


  render() {
    const { meeting, ui } = this.props;
    return (
      <div>
        { !meeting.stopTime && <MeetingSocket meetingId={this.props.params.meetingId} stopping={ui.stopping} /> }
        { meeting.startTime && !meeting.stopTime && !ui.stopping && <TimeTicker startTime={meeting.startTime} /> }
        { ui.joining && <MeetingStatusMessage message="Joining meeting..." showStartNew={true} /> }
        { !ui.joining && <MeetingView onStopMeeting={this.props.handleStopMeeting} meeting={meeting} ui={ui} /> }
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
const mapDispatchToProps = {
  handleStopMeeting: stopMeeting
};
const MeetingContainer = connect(mapStateToProps, mapDispatchToProps)(Meeting);
export default MeetingContainer;
