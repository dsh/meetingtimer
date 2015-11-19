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
    this.listen(this.meeting.id);
  },
  handleMessage: function(msg) {
    var m = JSON.parse(msg);
    if (m.event === "joined") {
      this.setState({
        started: true,
        meeting: m.meeting
      });
    }
    else if (m.event === "stopped") {
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
    $.post("/start", data, this.handleMessage);
  },
  stopMeeting: function(timeElapsed) {
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
    // @todo populate this from play route??
    var websSocketUrl = "/meeting-socket/" + meetingId;
    this.ws = new WebSocket("ws://" + location.hostname + ':' + location.port + websSocketUrl);
    this.ws.onmessage = function(msg) {
      this.handleMessage(msg);
    };
    this.ws.onclose = this.stopMeeting;
    this.ws.onerror = this.stopMeeting;
  },
  render: function () { return (
    <div>
      <input type="button" value="start" onClick={this.startMeeting} />
      <table>
        <tr><td>meeting.id</td><td>{this.meeting.id}</td></tr>
        <tr><td>started</td><td>{this.started}</td></tr>
        <tr><td>timeElapsed</td><td>{this.timeElapsed}</td></tr>
      </table>
    </div>
  );}
});
