import React, { Component, PropTypes } from 'react'

export default class MeetingTime extends Component {
  render() {
    const {
      id, startTime
      } = this.props;
    return (
      <span>
        <input type="text" id={id} {...startTime} />
      </span>
    );
  }
}
