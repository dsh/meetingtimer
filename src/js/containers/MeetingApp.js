import React, { Component } from 'react'

export default class MeetingApp extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}
