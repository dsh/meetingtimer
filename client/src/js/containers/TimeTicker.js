import React, { Component, PropTypes } from 'react'

export default class TimeTicker extends Component {

  tick = () => {
    this.props.onTick(new Date().getTime());
  };

  componentWillMount() {
    this.interval = setInterval(this.tick, this.props.tickIntervalMs);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render = () => <div></div>;
}


TimeTicker.propTypes = {
  onTick: PropTypes.func.isRequired,
  tickIntervalMs: PropTypes.number.isRequired
};

