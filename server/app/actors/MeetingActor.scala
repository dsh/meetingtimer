package actors

import akka.actor._
import akka.event.LoggingReceive
import models.Meeting
import play.api.Logger
import play.api.libs.json._

import scala.concurrent.duration._


object MeetingActor {
  def props(meeting: Meeting): Props = Props(classOf[MeetingActor], meeting)

  sealed trait MeetingMessage
  case class JoinMeeting() extends MeetingMessage
  case class StopMeeting() extends MeetingMessage

  // convert meeting messages from JSON that are received from the client
  implicit object MeetingMessageFormat extends Format[MeetingMessage] {
    def writes(msg: MeetingMessage) = JsNull
    def reads(json: JsValue) = (json \ "command").asOpt[String] match {
      case Some("join") => JsSuccess(JoinMeeting())
      case Some("stop") => JsSuccess(StopMeeting())
      case _ => JsError()
    }
  }
}
class MeetingActor(initialMeeting: Meeting) extends Actor with ActorLogging {

  import actors.MeetingActor._
  import actors.UserActor._

  // @todo need a heartbeat from clients to this from triggering.
  context.setReceiveTimeout(4 hours)


  def started(meeting: Meeting, users: Set[ActorRef]): Receive = {
    def sendStopped(m: Meeting, us: Set[ActorRef]) = us foreach { _ ! Stopped(m) }

    LoggingReceive {
      case JoinMeeting() =>
        Logger.info("Join Meeting")
        context watch sender
        sender ! Joined(meeting)
        context become started(meeting, users + sender)
      case Terminated(user) =>
        context become started(meeting, users - user)
      case StopMeeting() =>
        Logger.info("Stop Meeting")
        val stoppedMeeting = meeting.stop
        sendStopped(stoppedMeeting, users)
        context become stopped(stoppedMeeting)
      case ReceiveTimeout =>
        sendStopped(meeting, users)
        self ! PoisonPill
    }
  }

  def stopped(meeting: Meeting): Receive = LoggingReceive {
    case JoinMeeting() =>
      sender ! Stopped(meeting)
    case ReceiveTimeout =>
      self ! PoisonPill
  }

  // @todo become started or stopped depending on stopTime
  // start with a user to send back the Joined message immediately?
  def receive = started(initialMeeting, Set.empty)
}
