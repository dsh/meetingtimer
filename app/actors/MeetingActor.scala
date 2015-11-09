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

  def receive = {
    case JoinMeeting() =>
      users += sender
      context watch sender
      sender ! Joined(meeting)
    case StopMeeting() =>
      val timeElapsed = 100
      users foreach { _ ! Stopped(timeElapsed) }
      context stop self
    case Terminated(user) => users -= user
  }
}
