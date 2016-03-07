import React, { Component, PropTypes } from 'react'
require('./AlertBox.less');

export default class AlertBox extends Component {

  render() {
    const { type, message, onClose } = this.props;
    const cls = "alert-box " + type;
    return (
      <div className={cls}>
        <span className="message">{message}</span>
        { onClose && <a className="btn-close" onClick={onClose}>x</a> }
      </div>
    )
  }
}

AlertBox.propTypes = {
  type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func
};

