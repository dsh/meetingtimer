import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import timeElapsed, {timeElapsedString} from '../lib/timeElapsed'
import formatCost from '../lib/formatCost'
const moment = require('moment');
require('frozen-moment');


export default class MeetingSummary extends Component {

  render() {
    const { meeting, now } = this.props;
    const te = Math.round(timeElapsed(meeting.startTime, meeting.stopTime ? meeting.stopTime*1000 : now));
    const duration = timeElapsedString(te).substr(0, 8); // truncate the fractional seconds
    const cost =  formatCost(
      meeting.participants
      * te / (60 * 60)
      * meeting.hourlyRate
    );
    const startDateTime = moment(meeting.startTime * 1000).freeze();
    const startDate = startDateTime.format("MMM D YYYY");
    const startTime = startDateTime.format("h:mm A");

    return (
      <div className="meeting-summary">
        <div className="ms-id meeting-id"><Link to={meeting._links.view}>{meeting.id}</Link></div>
        <div className="ms-name">{meeting.name}</div>
        <div className="ms-start-time">
          <div className="date">{startDate}</div>
          <div className="time">{startTime}</div>
        </div>
        <div className="ms-time-elapsed">{duration}</div>
        <div className="ms-cost"><div className="currency-symbol">$</div><div className="cost">{cost}</div></div>
      </div>
    );
  }
}

MeetingSummary.propTypes = {
  meeting: PropTypes.object.isRequired,
  now: PropTypes.number.isRequired
};

