import React, { Component } from 'react'
import { connect } from 'react-redux'
import Router from 'react-router'
import JoinMeeting from '../components/JoinMeeting'
import { joinMeeting } from '../actions/NewMeeting'

class NewMeeting extends Component {
  render() {
    return (
      <div>
        <JoinMeeting onSubmit={data => this.props.history.pushState(null, "/m/" + data.meetingId)} />
      </div>
    )
  }
}

export const NewMeetingContainer = connect()(NewMeeting);
