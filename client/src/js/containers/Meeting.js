import React, { Component } from 'react'
import { connect } from 'react-redux'
import { stopMeeting, copyToClipboard, meetingTick } from '../actions'
import MeetingSocket from './MeetingSocket'
import TimeTicker from './TimeTicker'
import MeetingView from '../components/MeetingView'
import MeetingStatusMessage from '../components/MeetingStatusMessage'
import { tickIntervalMs } from '../constants'
import timeElapsed from '../lib/timeElapsed'



class Meeting extends Component {
  render() {
    const { meeting, ui, params: {meetingId}, handleStopMeeting, handleCopyToClipboard, handleTick } = this.props;
    return (
      <div>
        { !meeting.stopTime && <MeetingSocket meetingId={meetingId} stopping={ui.stopping} /> }
        { meeting.startTime && !meeting.stopTime && !ui.stopping && <TimeTicker onTick={handleTick} tickIntervalMs={tickIntervalMs} /> }
        { ui.joining && <MeetingStatusMessage message="Joining meeting..." showStartNew={true} /> }
        { !ui.joining &&
          <MeetingView onStopMeeting={handleStopMeeting} onCopyToClipboard={handleCopyToClipboard}
                       meeting={meeting} ui={ui} /> }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({meeting: state.meeting, ui: state.ui});
const mapDispatchToProps = {
  handleStopMeeting: stopMeeting,
  handleCopyToClipboard: copyToClipboard,
  handleTick: meetingTick
};
const MeetingContainer = connect(mapStateToProps, mapDispatchToProps)(Meeting);
export default MeetingContainer;
