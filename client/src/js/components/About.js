import React, { Component } from 'react'
import { Link } from 'react-router'

require('./About.less');

export default class About extends Component {
  render = () => (
    <div className="about">
      <p>
        My job is becoming increasingly bureaucratic and "corporate."
        We now spend countless hours in meetings instead of getting real work done.
        There were meeting timers out there that show you how much time and money are being wasted,
          but none where I could share a link with like minded colleagues.
      </p>

      <p>
        <Link to="/">meetingtimer.io</Link> fills this need, providing a distributed way of seeing the waste
        from unnecessary meetings.
      </p>

      <p>
        At the same time, I am looking to get out of PHP and old school JavaScript.
        This project gives me the chance to train myself in the technologies I want to work in.
      </p>

      <ul>
        <li>ReactJS + Redux</li>
        <li>Scala, Akka and Play</li>
        <li>Functional programming</li>
        <li>TypeScript (coming soon)</li>
        <li>Reactive Programming (coming soon)</li>
        <li>Hadoop + Spark (coming soon)</li>
      </ul>

      <p>
        If you'd like to hire a hard working, bright, self-starter in any of the above or related areas, feel free
        to reach out to
          me <a target="_blank" href="https://www.linkedin.com/in/dshennen">LinkedIn</a> or <a href="mailto:dennis@28studios.com">dennis@28studios.com</a>.
      </p>

      <p>
        I'm also open to bug reports and code reviews.
        Feature requests will probably be ignored unless I think it is a really cool idea.
      </p>

    </div>
  )
}