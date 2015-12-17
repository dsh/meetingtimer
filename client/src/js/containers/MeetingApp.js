import React, { Component } from 'react'
import JoinMeeting from '../components/JoinMeeting'
import {navigateToMeeting} from '../actions/NewMeeting'
import { Link } from 'react-router'
require('../../stylesheets/reset.css');
require('./MeetingApp.less');


export default class MeetingApp extends Component {
  // @todo temporary workaround https://phabricator.babeljs.io/T6656
  constructor(props) {
    super(props);
  }

  handleJoinMeeting = formData => this.props.dispatch(navigateToMeeting(formData.meetingId));

  render() {
    return (
      <div>
        <div className="nav-bar">
          <div className="nav-link-list">
            <Link className="nav-site-name" to="/">meetingtimer.io</Link>
            <Link className="nav-link" to="/about">about</Link>
            <a className="nav-link" href="https://github.com/dsh/meetingtimer">github</a>

          </div>
          <div className="nav-join-meeting">
            <span className="join-text">Join a meeting in progress</span>
            <JoinMeeting onSubmit={this.handleJoinMeeting} />
          </div>
        </div>
        {this.props.children}
      </div>
    )
  }
}
