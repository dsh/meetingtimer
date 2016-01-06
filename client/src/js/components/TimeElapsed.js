import React, { Component, PropTypes } from 'react'
import BlockLetters from './BlockLetters'
import { timeElapsedString } from '../lib/timeElapsed'


export default class TimeElapsed extends Component {
  render() {
    const { seconds } = this.props;
    const time = timeElapsedString(seconds);
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
