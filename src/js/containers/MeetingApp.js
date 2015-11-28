import React, { Component } from 'react'

export default class MeetingApp extends Component {
  render() {
    return (
      <div>
        <div>Header</div>
        {this.props.children}
        <div>Footer</div>
      </div>
    )
  }
}
