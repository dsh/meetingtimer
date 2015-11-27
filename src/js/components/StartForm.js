import React, { Component, PropTypes } from 'react'

export default class StartForm extends Component {
  render() {
    return (
      <form>
        <input type="button" value="start" onClick={} />
      </form>
    )
  }
}

StartForm.propTypes = {
  onStart: PropTypes.func.isRequired
}
