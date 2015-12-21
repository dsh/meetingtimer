import React, { Component } from 'react'
import { connect } from 'react-redux'
import JoinMeeting from '../components/JoinMeeting'
import {navigateToMeeting} from '../actions'
import { Link } from 'react-router'
import AlertBox from '../components/AlertBox'
import {errorAction} from '../actions'
require('../../stylesheets/reset.css');
require('./MeetingApp.less');


class MeetingAppComponent extends Component {

  handleJoinMeeting = formData => this.props.dispatch(navigateToMeeting(formData.meetingId));

  handleCloseError = () => this.props.dispatch(errorAction(""));

  render() {
    const { ui } = this.props;
    var join = '';
    if (!ui.inProgress) {
      join = (
        <div className="nav-join-meeting">
          <div className="join-text">Join a meeting in progress</div>
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
        {ui.error && <AlertBox type="error" message={ui.error} onClose={this.handleCloseError} />}
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
