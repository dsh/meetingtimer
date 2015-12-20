import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createAction } from 'redux-actions';
import { meetingTick } from '../actions'
import { tickIntervalMs } from '../constants'
import timeElapsed from '../lib/timeElapsed'

class TimeTickerComponent extends Component {

  tick = () => {
    this.props.dispatch(meetingTick(timeElapsed(this.props.startTime)));
  };

  componentWillMount() {
    this.interval = setInterval(this.tick, tickIntervalMs);
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
