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
    console.log(this.props);
    return (
      <div>
        { !this.props.meeting.stopTime && <MeetingSocket meetingId={this.props.params.meetingId} /> }
        { this.props.meeting.startTime &&
          !this.props.meeting.stopTime &&
          !this.props.ui.stopping &&
          <TimeTicker startTime={this.props.meeting.startTime} />
        }
        { this.props.ui.joining && <JoiningMeeting /> }
        { !this.props.ui.joining &&
          <MeetingView onStopMeeting={this.handleStopMeeting} meeting={this.props.meeting} ui={this.props.ui} />
        }
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
