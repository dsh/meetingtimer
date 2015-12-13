import React, { Component, PropTypes } from 'react'
import {reduxForm} from 'redux-form'
import MeetingTime from './MeetingTime'
import Input from './Input'
import InputError from './InputError'
import {validTimeFormats} from '../actions/NewMeeting'

var _ = require('lodash');
var moment = require('moment'); // no es6 import

export const fields = ['name', 'startTime', 'participants', 'hourlyRate'];


class StartMeeting extends Component {

  render() {
    const {
      fields: {name, startTime, participants, hourlyRate},
      handleSubmit
      } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Input id="meeting_name" label="Name" type="text" field={name} />
        <div>
          <label htmlFor="meeting_startTime">Start Time:</label>
          <MeetingTime id="meeting_startTime"  startTime={startTime} />
          <InputError field={startTime} />
        </div>
        <Input id="meeting_participants" label="Participants" type="text" field={participants} />
        <Input id="meeting_hourlyRate" label="Hourly Rate" type="text" field={hourlyRate} />
        <button onClick={handleSubmit}>Start</button>
      </form>
    )
  }
}

StartMeeting.propTypes =  {
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

const validate = values => {
  const m = _.mapValues(values, _.trim);
  var requiredErrors = _.chain(m).pick(_.isEmpty).mapValues(v => "Required").value();
  var errors = {};
  if (!/^[0-9]+$/.test(m.participants) || Number(m.participants) <= 0) {
    errors.participants = "Must be a positive integer";
  }
  if (!/^[0-9]+(\.[0-9]+)?$/.test(m.hourlyRate) || Number(m.hourlyRate) <= 0) {
    errors.hourlyRate = "Must be a positive number";
  }
  if (!moment(m.startTime, validTimeFormats).isValid()) {
    errors.startTime = "Start time invalid";
  }
  // Missing required errors take precedence
  return Object.assign({}, errors, requiredErrors);
}

export default reduxForm({
  form: 'start_meeting',
  fields,
  validate
})(StartMeeting);
