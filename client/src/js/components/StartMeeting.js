import React, { Component, PropTypes } from 'react'
import {reduxForm} from 'redux-form'
export const fields = ['name', 'startTime', 'participants', 'hourlyRate'];


class StartMeeting extends Component {

  render() {
    const {
      fields: {name, startTime, participants, hourlyRate},
      handleSubmit
      } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="meeting_name">Name:</label> <input id="meeting_name" type="text" {...name} />
        </div>
        <div>
          <label htmlFor="meeting_startTime">Start Time:</label> <input id="meeting_startTime" type="text" {...startTime} />
        </div>
        <div>
          <label htmlFor="meeting_participants">Participants:</label> <input id="meeting_participants" type="text" {...participants} />
        </div>
        <div>
          <label htmlFor="meeting_hourlyRate">Hourly Rate:</label> <input id="meeting_hourlyRate" type="text" {...hourlyRate} />
        </div>
        <button onClick={handleSubmit}>Start</button>
      </form>
    )
  }
}

StartMeeting.propTypes =  {
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired
};


export default reduxForm({
  form: 'start_meeting',
  fields
})(StartMeeting);
