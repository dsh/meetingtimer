var MeetingCost = React.createClass({
  render: function () {
    return (
      <div>${this.props.hourlyRate / 3600 * this.props.participants * this.props.timeElapsed}</div>
    );
  }
});

var MeetingButton = React.createClass({
  render: function () {
    if (this.props.started) {
      return ( <input type="button" value="stop" onClick={this.props.stopMeetingHandler} /> );
    } else {
      return ( <input type="button" value="start" onClick={this.props.startMeetingHandler} /> );
    }
  }
});


var MeetingApp = React.createClass({
  // @todo how do you do privates in a react class?

  ws: null,
  getInitialState: function () {
    return {
      meeting: {
        id: null,
        name: null,
        startTime: null,
        participants: null,
        hourlyRate: null
      },
      started: false,
      timeElapsed: 0
    };
  },
  componentWillMount: function () {
    this.listen(this.state.meeting.id);
  },
  handleMessage: function(event) {
    console.log(event);
    var msg = JSON.parse(event.data);
    if (msg.event === "joined") {
      this.setState({
        started: true,
        meeting: msg.meeting
      });
    }
    else if (msg.event === "stopped") {
      this.stopMeeting(m.timeElapsed);
    }
  },
  startMeeting: function() {
    var data = {
      name: "meeting name",
      startTime: Math.round(new Date() / 1000),
      participants: 10,
      hourlyRate: 100
    };
    $.post("/start", data, this.listen);
  },
  stopMeeting: function(timeElapsed) {
    this.send("stop");
    this.ws.close();
    this.setState({started: false});
    if (timeElapsed) {
      this.setState({timeElapsed: timeElapsed});
    }
  },
  listen: function (meetingId) {
    if (this.ws) {
      this.ws.close();
    }
    if (!meetingId) {
      return;
    }
    // @todo populate this from play route??
    var websSocketUrl = "/meeting-socket/" + meetingId;
    this.ws = new WebSocket("ws://" + location.hostname + ':' + location.port + websSocketUrl);
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.stopMeeting;
    this.ws.onerror = this.stopMeeting;
    this.ws.onopen = this.joinMeeting;
  },
  joinMeeting: function() {
    this.send("join");
  },
  send: function(command) {
    if (!this.ws) {
      return;
    }
    this.ws.send(JSON.stringify({"command": command}));
  },
  render: function () { return (
    <div>
      <MeetingButton started={this.state.started}
                     startMeetingHandler={this.startMeeting}
                     stopMeetingHandler={this.stopMeeting} />
      <table>
        <tbody>
          <tr><td>meeting.id</td><td>{this.state.meeting.id}</td></tr>
          <tr><td>started</td><td>{this.state.started}</td></tr>
          <tr><td>name</td><td>{this.state.meeting.name}</td></tr>
          <tr><td>startTime</td><td>{this.state.meeting.startTime}</td></tr>
          <tr><td>participants</td><td>{this.state.meeting.participants}</td></tr>
          <tr><td>hourlyRate</td><td>{this.state.meeting.hourlyRate}</td></tr>
          <tr><td>timeElapsed</td><td>{this.state.timeElapsed}</td></tr>
          <tr>
            <td>Cost</td>
            <td>
              <MeetingCost timeElapsed={this.state.timeElapsed}
                           participants={this.state.meeting.participants}
                           hourlyRate={this.state.meeting.hourlyRate} />
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );}
});


React.render(
  <MeetingApp />,
  document.getElementById("application")
);
