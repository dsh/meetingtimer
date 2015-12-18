import React, { Component, PropTypes } from 'react'
import {reduxForm} from 'redux-form'
import MeetingTime from './MeetingTime'
import Input from './Input'
import InputError from './InputError'
import {validTimeFormats} from '../actions/NewMeeting'
require('./StartMeeting.less');

var _ = require('lodash');
var moment = require('moment'); // no es6 import

export const fields = ['name', 'startTime', 'participants', 'hourlyRate'];

// find current time rounded to nearest half hour
const halfHour = 30 * 60 * 1000;
const nowRounded = moment(Math.round(new Date() / halfHour) * halfHour).format("h:mm A");


class StartMeeting extends Component {

  render() {
    const {
      fields: {name, startTime, participants, hourlyRate},
      handleSubmit
      } = this.props;
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
  const m = _.mapValues(values, _.trim);
  var requiredErrors = _.chain(m).pick(_.isEmpty).mapValues(v => "Required.").value();
  var errors = {};
  if (!/^[0-9]+$/.test(m.participants) || Number(m.participants) <= 0) {
    errors.participants = "Must be a positive integer.";
  }
  if (!/^[0-9]+(\.[0-9]+)?$/.test(m.hourlyRate) || Number(m.hourlyRate) <= 0) {
    errors.hourlyRate = "Must be a positive number.";
  }
  if (!moment(m.startTime, validTimeFormats).isValid()) {
    errors.startTime = "Start time invalid.";
  }
  // Missing required errors take precedence
  return Object.assign({}, errors, requiredErrors);
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
