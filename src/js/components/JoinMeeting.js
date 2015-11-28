import React, { Component, PropTypes } from 'react'
import {reduxForm} from 'redux-form'
export const fields = ['meetingId'];


class JoinMeeting extends Component {

  render() {
    const {
      fields: {meetingId},
      handleSubmit
      } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <label htmlFor="meeting_id">Meeting ID:</label> <input id="meeting_id" type="text" {...meetingId} />
        <button onClick={handleSubmit}>Join</button>
      </form>
    )
  }
}

JoinMeeting.propTypes =  {
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired
};


export default reduxForm({
  form: 'join_meeting',
  fields
})(JoinMeeting);
