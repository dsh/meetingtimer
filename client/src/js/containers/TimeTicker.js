import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createAction } from 'redux-actions';
import { meetingTick } from '../actions/Meeting'

export function timeElapsed(startTime) {
  // @todo does this handle time zones correctly?
  // if start time is in the future, timeElapsed is 0
  return Math.max(0, (new Date().getTime()/1000) - startTime);
}

class TimeTickerComponent extends Component {

  tick = () => {
    this.props.dispatch(meetingTick(timeElapsed(this.props.startTime)));
  };

  componentWillMount() {
    // @todo make th einterval configurable
    this.interval = setInterval(this.tick, 2000);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  // @todo can I render nothing?
  render = () => <div></div>;
}

TimeTickerComponent.propTypes =  {
  startTime: PropTypes.number.isRequired
};


const TimeTicker = connect()(TimeTickerComponent);
export default TimeTicker;
