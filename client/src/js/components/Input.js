import React, { Component, PropTypes } from 'react'
import InputError from './InputError'

export default class Input extends Component {
  render() {
    const { id, type, label, field } = this.props;
    return (
      <div>
        <div>
          <label forHtml={id}>{label}:</label>
          <input type={type} id={id} {...field} />
        </div>
        <InputError field={field} />
      </div>
    );
  }
}

Input.propTypes =  {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired
};
