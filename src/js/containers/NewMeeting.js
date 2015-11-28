import React from 'react';
import { connect } from 'react-redux'
import JoinMeeting from '../components/JoinMeeting'

export const NewMeeting = React.createClass({

  render: function() {
    return (
      <div>
        <JoinMeeting {...this.props} />
      </div>
    )
  }
});

function mapStateToProps(state) {
  console.log(state);
  return  {};
}

export const NewMeetingContainer = connect(mapStateToProps)(NewMeeting);
