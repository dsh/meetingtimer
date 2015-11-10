package actors

import akka.actor._
import models.Meeting

object MeetingActor {
  def props(meeting: Meeting): Props = Props(classOf[MeetingActor], meeting)

  trait MeetingMessage
  case class JoinMeeting() extends MeetingMessage
  case class StopMeeting() extends MeetingMessage
}
class MeetingActor(meeting: Meeting) extends Actor with ActorLogging {

  import actors.MeetingActor._
  import actors.UserActor._

  // To cluster I would use a pub/sub and make each meeting a "topic".
  // Users would subscribe to the meeting topic for updates.
  var users = Set[ActorRef]()

  // @todo Add a timeout so that if a meeting runs too long we automatically kill it.

  // @todo need to inject this so we can unit test\
  // @todo is Int fine or do we need long?
  def computeTimeElapsed(): Int = (System.currentTimeMillis / 1000).toInt - meeting.startTime

  def receive = {
    case JoinMeeting() =>
      users += sender
      context watch sender
      sender ! Joined(meeting)
    case StopMeeting() =>
      users foreach { _ ! Stopped(computeTimeElapsed()) }
      context stop self
    case Terminated(user) =>
      users -= user
      // @todo Leave the meeting running until a timeout elapsed so users can reconnect.
      if (users.size == 0)
        context stop self
  }
}
