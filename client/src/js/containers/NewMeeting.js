import React, { Component } from 'react'
import { connect } from 'react-redux'
import JoinMeeting from '../components/JoinMeeting'
import StartMeeting from '../components/StartMeeting'
import {navigateToMeeting, startMeeting} from '../actions/NewMeeting'

class NewMeeting extends Component {

  // @todo temporary workaround https://phabricator.babeljs.io/T6656
  constructor(props) {
    super(props);
  }

  handleJoinMeeting = formData => this.props.dispatch(navigateToMeeting(formData.meetingId));
  handleStartMeeting = formData => this.props.dispatch(startMeeting(formData));

  render() {
    return (
      <div>
        <JoinMeeting onSubmit={this.handleJoinMeeting} />
        <br /><br />
        <StartMeeting onSubmit={this.handleStartMeeting} />
      </div>
    )
  }
}

export const NewMeetingContainer = connect()(NewMeeting);
