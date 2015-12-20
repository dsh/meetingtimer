import React, { Component } from 'react'
import { connect } from 'react-redux'
import JoinMeeting from '../components/JoinMeeting'
import {navigateToMeeting} from '../actions/NewMeeting'
import { Link } from 'react-router'
require('../../stylesheets/reset.css');
require('./MeetingApp.less');


class MeetingAppComponent extends Component {

  handleJoinMeeting = formData => this.props.dispatch(navigateToMeeting(formData.meetingId));

  render() {
    var join = '';
    if (!this.props.ui.inProgress) {
      join = (
        <div className="nav-join-meeting">
          <span className="join-text">Join a meeting in progress</span>
          <JoinMeeting onSubmit={this.handleJoinMeeting} />
        </div>
      );
    }
    return (
      <div>
        <div className="nav-bar">
          <div className="nav-link-list">
            <Link className="nav-site-name" to="/">meetingtimer.io</Link>
            <Link className="nav-link" to="/about">about</Link>
            <a className="nav-link" target="_blank" href="https://github.com/dsh/meetingtimer">github</a>
          </div>
          {join}
        </div>
        {this.props.children}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    ui: state.ui
  };
}
const MeetingApp = connect(mapStateToProps)(MeetingAppComponent);
export default MeetingApp;
