import React, { Component } from 'react'
import { Link } from 'react-router'

export default class StartNewMeetingLink extends Component {
  render = () => <Link className="btn" to="/">Start a new meeting</Link>
}
