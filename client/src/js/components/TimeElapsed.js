import React, { Component, PropTypes } from 'react'
import BlockLetters from './BlockLetters'

export default class TimeElapsed extends Component {
  render() {
    const { seconds } = this.props;
    // @todo doesn't work for times > 24h
    // const time = moment(seconds, "X").format("HH:mm:ss.S");
    const h = Math.floor(seconds / (60*60) );
    const secondsLessHours = seconds - h * 60 * 60;
    const m = Math.floor(secondsLessHours / 60);
    const s = secondsLessHours - m * 60;
    const time = _.padLeft(h, 2, "0") + ":" + _.padLeft(m, 2, "0") + ":" + _.padLeft(s.toFixed(1), 4, "0");
    return (
      <div className="timeElapsed">
        <BlockLetters letters={time} />
      </div>
    );
  }
}

TimeElapsed.propTypes =  {
  seconds: PropTypes.number.isRequired
};
