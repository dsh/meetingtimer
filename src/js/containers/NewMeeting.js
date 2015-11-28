import React, { Component } from 'react'
import { connect } from 'react-redux'
import JoinMeeting from '../components/JoinMeeting'
import { joinMeeting } from '../actions/NewMeeting'

class NewMeeting extends Component {
  render() {
    const { dispatch } = this.props;
    return (
      <div>
        <JoinMeeting onSubmit={data => dispatch(joinMeeting(data))} />
      </div>
    )
  }
}

export const NewMeetingContainer = connect()(NewMeeting);
