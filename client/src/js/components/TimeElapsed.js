import React, { Component, PropTypes } from 'react'
import BlockLetters from './BlockLetters'
const padLeft = require('lodash/string/padLeft');

export default class TimeElapsed extends Component {
  render() {
    const { seconds } = this.props;
    const h = Math.floor(seconds / (60*60) );
    const secondsLessHours = seconds - h * 60 * 60;
    const m = Math.floor(secondsLessHours / 60);
    const s = secondsLessHours - m * 60;
    const time = padLeft(h, 2, "0") + ":" + padLeft(m, 2, "0") + ":" + padLeft(s.toFixed(1), 4, "0");
    return (
      <div className="time-elapsed">
        <BlockLetters letters={time} />
      </div>
    );
  }
}

TimeElapsed.propTypes =  {
  seconds: PropTypes.number.isRequired
};
