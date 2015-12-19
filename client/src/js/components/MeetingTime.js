import React, { Component, PropTypes } from 'react'

export default class MeetingTime extends Component {
  render() {
    const {
      id, startTime
      } = this.props;
    // @todo if mobile browser use type=time
    return (
      <span>
        <input type="text" id={id} {...startTime} />
      </span>
    );
  }
}
