package actors

import actors.UserActor.UserRegistered
import akka.actor._
import akka.event.LoggingReceive
import models.Meeting

object MeetingManagerActor {
  def props() = Props(new MeetingManagerActor)

  trait MeetingManagerMessage
  case class CreateMeeting(meeting: Meeting) extends MeetingManagerMessage
  case class RegisterUser(meetingId: String, user: ActorRef) extends MeetingManagerMessage
}


class MeetingManagerActor extends Actor with ActorLogging {
  import actors.MeetingManagerActor._

  val meetings = scala.collection.mutable.Map[String, ActorRef]()

  def receive = LoggingReceive {
    case CreateMeeting(meeting) =>
      // Not safe for concurrent map
      val meetingActor = meetings.getOrElseUpdate(meeting.id, context.actorOf(MeetingActor.props(meeting)))
      context watch meetingActor
    case RegisterUser(meetingId, user) =>
      // @todo RegisterUser could be received before the CreateMeeting. Need a retry.
      meetings.get(meetingId).foreach ( sender ! UserRegistered(_) )
    // @todo can we extract the meetingId from meetingActor.meeting.id ?
    case Terminated(meetingActor) => meetings retain { (_, m) => m != meetingActor }

  }
}
