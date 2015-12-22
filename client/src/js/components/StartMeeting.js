import React, { Component, PropTypes } from 'react'
import {reduxForm} from 'redux-form'
import MeetingTime from './MeetingTime'
import AlertBox from './AlertBox'
import {validTimeFormats} from '../constants.js'
const mapValues = require('lodash/object/mapValues');
const trim = require('lodash/string/trim');
const isEmpty = require('lodash/lang/isEmpty');
const filter = require('lodash/collection/filter');
const map  = require('lodash/collection/map');

const moment = require('moment');
require('./StartMeeting.less');


const fields = ['name', 'startTime', 'participants', 'hourlyRate'];


class StartMeeting extends Component {

  render() {
    const {
      fields: {name, startTime, participants, hourlyRate},
      handleSubmit,
      submitFailed
      } = this.props;
    const errors = filter(this.props.fields, f => (submitFailed && f.invalid && f.touched))
      .map(f => <AlertBox key={f.name} type="error" message={f.error} />);
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
  state => {
    const roundInterval = 15 * 60 * 1000;
    return {
      initialValues: {
        // find current time rounded to nearest 15 minutes
        startTime: moment(Math.round(new Date() / roundInterval) * roundInterval).format("h:mm A")
      }
    };
  }
)(StartMeeting);
