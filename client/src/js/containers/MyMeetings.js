import React, { Component } from 'react'
import TimeTicker from './../components/TimeTicker'
import { connect } from 'react-redux'
import { loadMyMeetingsReequest, myMeetingsTick } from '../actions'
import MeetingSummary from '../components/MeetingSummary'
import StartNewMeetingLink from '../components/StartNewMeetingLink'
require('./MyMeetings.less');

class MyMeetings extends Component {

  componentWillMount() {
    this.props.dispatch(loadMyMeetingsReequest())
  }

  handleTick = now => {
    this.props.dispatch(myMeetingsTick(now))
  };

  render() {
    const {meetings, now} = this.props;
    const meetingSummaries = meetings.map(m => (<MeetingSummary key={m.id} meeting={m} now={now} />));
    var meetingList;
    if (meetingSummaries.length === 0) {
      meetingList = <p className="no-meetings">You have no meetings yet.</p>;
    } else {
      meetingList = <div>
        <TimeTicker onTick={this.handleTick} tickIntervalMs={1000} />
        <div className="meeting-summary meeting-summary-header">
        <div className="ms-id">ID</div>
        <div className="ms-name">Name</div>
        <div className="ms-start-time">Started</div>
        <div className="ms-time-elapsed">Duration</div>
        <div className="ms-cost">Cost</div>
        </div>
        {meetingSummaries}
      </div>
    }

    return (
      <div>
        <div className="my-meetings">
          {meetingList}
        </div>
        <div className="start-meeting-link">
          <StartNewMeetingLink />
        </div>
      </div>
  );
  }
}

const mapStateToProps = (state) => ({meetings: state.myMeetings.meetings, now: state.myMeetings.now});
const MyMeetingsContainer = connect(mapStateToProps)(MyMeetings);
export default MyMeetingsContainer;
