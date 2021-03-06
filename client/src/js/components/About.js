import React, { Component } from 'react'
import { Link } from 'react-router'

require('./About.less');

export default class About extends Component {
  render = () => (
    <div className="about">
      <p className="see-at-github">
        See this project at <a target="_blank" href="https://github.com/dsh/meetingtimer">GitHub</a>.
      </p>
      <h1>About</h1>
      <p>
        I have always been adverse to meetings without purpose and the waste they cause.
        As my last job became more and more bureaucratic we had more and more meetings
        that never led anywhere. All of this overhead resulted in a marked decrease in productivity.
      </p>
      <p>
          There are meeting timers out there that show you how much time and money are being wasted,
          but none where I could share a link with like minded colleagues.&nbsp;
          <Link to="/">meetingtimer.io</Link> fills this need, providing a distributed way of seeing the waste
          from unnecessary meetings.
      </p>

      <p>
        When I wrote this, I was looking to get out of PHP and old school JavaScript.
        This project gave me the chance to train myself in technologies I found interesting
        and create some code for my portfolio to show off what I can do.
      </p>

      <ul>
        <li>ReactJS + Redux</li>
        <li>Scala, Akka, Play and Guice</li>
        <li>Functional programming</li>
      </ul>

      <p>
        Find out more about me at <a target="_blank" href="https://www.linkedin.com/in/dshennen">LinkedIn</a> or contact me at <a href="mailto:dennis@28studios.com">dennis@28studios.com</a>.
      </p>

      <p>
        I'm open to bug reports and code reviews.
        Feature requests will probably be ignored unless I think it is a really cool idea.
      </p>

      <h1>Thanks to</h1>


      <ul>
        <li><a href="https://github.com/xogeny">Michael Tiller</a> for an exhaustive JavaScript code review (that I have not had time to act on yet).</li>
        <li>Many friends for comprehensively testing the site and identifying many bugs.</li>
      </ul>
    </div>
  )
}
