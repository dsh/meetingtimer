import React, { Component, PropTypes } from 'react'
import {reduxForm} from 'redux-form'
import Input from './Input'
var _ = require('lodash');

export const fields = ['meetingId'];

class JoinMeeting extends Component {

  render() {
    const {
      fields: {meetingId},
      handleSubmit
      } = this.props;
    return (
      <div className="join-meeting">
        <form onSubmit={handleSubmit}>
          <input className="meeting-id" placeholder="meeting id" type="text" {...meetingId} />
          <button onClick={handleSubmit}>Join</button>
        </form>
      </div>
    )
  }
}

JoinMeeting.propTypes =  {
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

const validate = values => {
  const meetingId = _.trim(values.meetingId);
  var errors = {};
  if ( ! /^[0-9a-z]{8}/i.test(meetingId) ) {
    errors.meetingId = "Valid meeting ID required.";
  }
  return errors;
};

export default reduxForm({
  form: 'join_meeting',
  fields,
  validate
})(JoinMeeting);
