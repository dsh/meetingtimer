import React, { Component } from 'react'
import { connect } from 'react-redux'
import StartMeeting from '../components/StartMeeting'
import {startMeeting} from '../actions'
require("./NewMeeting.less");

class NewMeeting extends Component {

  handleStartMeeting = formData => this.props.dispatch(startMeeting(formData));

  render() {
    return (
      <div className="new-meeting">
        <div className="tag-line">
          Witty Tagline Goes Here
        </div>
        <StartMeeting onSubmit={this.handleStartMeeting} />
      </div>
    )
  }
}

const NewMeetingContainer = connect()(NewMeeting);
export default NewMeetingContainer;
