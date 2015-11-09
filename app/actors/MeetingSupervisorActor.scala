package actors

import akka.actor._
import models.Meeting

object MeetingSupervisorActor {
  def props() = Props(new MeetingSupervisorActor)

  trait MeetingSupervisorMessage
  case class CreateMeeting(meeting: Meeting) extends MeetingSupervisorMessage
}
class MeetingSupervisorActor extends Actor with ActorLogging {
  import actors.MeetingSupervisorActor._

  val meetings = scala.collection.mutable.Map[String, ActorRef]()

  def receive = {
    case CreateMeeting(meeting) =>
      // Not safe for concurrent map
      val meetingActor = meetings.getOrElseUpdate(meeting.id, context.actorOf(MeetingActor.props(meeting)))
      context watch meetingActor
    case Terminated(meetingActor) => meetings retain { (_, m) => m != meetingActor }

  }
}
