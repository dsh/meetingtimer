import React, { Component, PropTypes } from 'react'

export default class InputError extends Component {
  render() {
    const { field } = this.props;
    return (
      <div>
        {field.touched && field.error && <div className="error">{field.error}</div>}
      </div>
    );
  }
}

InputError.propTypes =  {
  field: PropTypes.object.isRequired
};
