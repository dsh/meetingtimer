import React, { Component } from 'react'
import TimeTicker from './TimeTicker'
import { connect } from 'react-redux'


class MyMeetings extends Component {
  render() {
    return (
      <div></div>
    );
  }
}

const MyMeetingsContainer = connect()(MyMeetings);
export default MyMeetingsContainer;
