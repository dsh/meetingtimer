import React, { Component, PropTypes } from 'react'

export default class MeetingTime extends Component {
  render() {
    const {
      id, startTime
      } = this.props;
    return (
      <span>
        <input type="time" id={id} {...startTime} />
      </span>
    );
  }
}
