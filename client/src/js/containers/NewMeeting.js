import React, { Component } from 'react'
import { connect } from 'react-redux'
import StartMeeting from '../components/StartMeeting'
import {startMeeting} from '../actions/NewMeeting'
require("./NewMeeting.less");

class NewMeeting extends Component {

  // @todo temporary workaround https://phabricator.babeljs.io/T6656
  constructor(props) {
    super(props);
  }

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

export const NewMeetingContainer = connect()(NewMeeting);
