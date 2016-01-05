import React, { Component } from 'react'
import { connect } from 'react-redux'
import StartMeeting from '../components/StartMeeting'
import MeetingStatusMessage from '../components/MeetingStatusMessage'

import {startMeeting} from '../actions'
require("./NewMeeting.less");

class NewMeeting extends Component {

  handleStartMeeting = formData => this.props.dispatch(startMeeting(formData));

  render() {
    if (this.props.ui.starting) {
      return <MeetingStatusMessage message="Starting meeting..." />;
    }
    return (
      <div className="new-meeting">
        <div className="tag-line">
          <span>When meetings suck...</span> <span>Share the pain!</span>
        </div>
        <StartMeeting onSubmit={this.handleStartMeeting} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ui: state.ui});
const NewMeetingContainer = connect(mapStateToProps)(NewMeeting);
export default NewMeetingContainer;
