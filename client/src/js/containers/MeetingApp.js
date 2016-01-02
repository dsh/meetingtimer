import React, { Component } from 'react'
import { connect } from 'react-redux'
import JoinMeeting from '../components/JoinMeeting'
import {joinMeeting, toggleMenu, clearErrorAction} from '../actions'
import AlertBox from '../components/AlertBox'
import Navigation from '../components/Navigation'
require('../../stylesheets/reset.css');
require('./MeetingApp.less');



class MeetingAppComponent extends Component {

  handleJoinMeeting = formData => this.props.dispatch(joinMeeting(formData.meetingId));
  handleCloseError = () => this.props.dispatch(clearErrorAction());
  handleToggleMenu = (newState) => this.props.dispatch(toggleMenu(newState));

  render() {
    const { ui } = this.props;
    return (
      <div>
        <div className="nav-bar">
          <Navigation menuOpen={ui.menuOpen} onToggleMenu={this.handleToggleMenu} />
          <div className="nav-join-meeting">
            <div className="join-text">Join a meeting in progress</div>
            <JoinMeeting onSubmit={this.handleJoinMeeting} />
          </div>
        </div>
        {ui.error && <AlertBox type="error" message={ui.error} onClose={this.handleCloseError} />}
        {this.props.children}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ui: state.ui});
const MeetingApp = connect(mapStateToProps)(MeetingAppComponent);
export default MeetingApp;
