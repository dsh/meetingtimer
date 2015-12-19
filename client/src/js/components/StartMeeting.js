import React, { Component, PropTypes } from 'react'
import {reduxForm} from 'redux-form'
import MeetingTime from './MeetingTime'
import {validTimeFormats} from '../actions/NewMeeting'
const mapValues = require('lodash/object/mapValues');
const trim = require('lodash/string/trim');
const isEmpty = require('lodash/lang/isEmpty');
const filter = require('lodash/collection/filter');
const map  = require('lodash/collection/map');

const moment = require('moment');
require('./StartMeeting.less');


export const fields = ['name', 'startTime', 'participants', 'hourlyRate'];

// find current time rounded to nearest half hour
const halfHour = 30 * 60 * 1000;
const nowRounded = moment(Math.round(new Date() / halfHour) * halfHour).format("h:mm A");


class StartMeeting extends Component {

  render() {
    const {
      fields: {name, startTime, participants, hourlyRate},
      handleSubmit,
      submitFailed
      } = this.props;
    console.log(this.props);
    const errors = filter(this.props.fields, f => (submitFailed && f.invalid && f.touched))
      .map(f => <div key={f.name} className="error">{f.error}</div>);
    return (
      <div className="start-meeting">
        <div className="start-meeting-header">
          Start a Meeting
        </div>
        <form onSubmit={handleSubmit}>
          <div className="start-meeting-name">
            <input id="meeting_name" placeholder="Daily Status Report" type="text" {...name} />
          </div>
          <div className="start-meeting-details">
            <span>starting at</span>
            <MeetingTime id="meeting_startTime" startTime={startTime} />
            <span>with</span>
            <input id="meeting_participants" placeholder="6" type="number" {...participants} />
            <span>people at $</span>
            <input id="meeting_hourlyRate" placeholder="50" type="number" {...hourlyRate} />
            <span>per hour.</span>
          </div>
          { errors && <div className="start-meeting-errors">{errors}</div> }
          <div className="start-meeting-button">
            <button onClick={handleSubmit}>Start</button>
          </div>
        </form>
      </div>
    )
  }
}

StartMeeting.propTypes =  {
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

const validate = values => {
  const m = mapValues(values, trim);
  var errors = {};
  if (isEmpty(m.name)) {
    errors.name = "Meeting name required.";
  }
  if (isEmpty(m.participants) || !/^[0-9]+$/.test(m.participants) || Number(m.participants) <= 0) {
    errors.participants = "Number of participants must be a positive integer.";
  }
  if (isEmpty(m.hourlyRate) || !/^[0-9]+(\.[0-9]+)?$/.test(m.hourlyRate) || Number(m.hourlyRate) <= 0) {
    errors.hourlyRate = "Hourly rate must be a positive number.";
  }
  if (isEmpty(m.startTime) || !moment(m.startTime, validTimeFormats).isValid()) {
    errors.startTime = "Start time invalid.";
  }
  return errors;
};

export default reduxForm(
  {
    form: 'start_meeting',
    fields,
    validate
  },
  state => ({
    initialValues: {
      startTime: nowRounded
    }
  })
)(StartMeeting);
