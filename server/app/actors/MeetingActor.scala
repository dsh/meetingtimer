package actors

import akka.actor._
import akka.event.LoggingReceive
import models.Meeting
import play.api.Logger
import play.api.libs.json._
import scala.concurrent.duration._


object MeetingActor {
  def props(meeting: Meeting): Props = Props(classOf[MeetingActor], meeting)

  sealed class MeetingMessage {
    // Add a user id to the meeting message. Needed for authorizing the stop action.
    def withUserId(userId: Option[String]) = this
  }
  case class JoinMeeting() extends MeetingMessage
  case class StopMeeting(userId: Option[String] = None) extends MeetingMessage {
    override def withUserId(newUserId: Option[String]) = this.copy(userId = newUserId)
  }
  case class Heartbeat() extends MeetingMessage

  val JoinMeetingActionType = "JOIN_MEETING"
  val StopMeetingActionType = "STOP_MEETING"
  val HeartbeatActionType = "HEARTBEAT"

  // convert meeting messages from JSON that are received from the client
  implicit object MeetingMessageFormat extends Format[MeetingMessage] {
    // We never write meeting messages to the client. We need this implemented, though, so
    // we can create the frame formatters for WebSocket.acceptWithActor.
    def writes(msg: MeetingMessage) = JsNull
    def reads(json: JsValue) = (json \ "type").asOpt[String] match {
      case Some(JoinMeetingActionType) => JsSuccess(JoinMeeting())
      case Some(StopMeetingActionType) => JsSuccess(StopMeeting())
      case Some(HeartbeatActionType) => JsSuccess(Heartbeat())
      case _ => JsError()
    }
  }
}
class MeetingActor(initialMeeting: Meeting) extends Actor with ActorLogging {

  import actors.MeetingActor._
  import actors.UserActor._

  // @todo need a heartbeat from clients to stop this from triggering.
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
      case m: StopMeeting =>
        Logger.info(s"Stop Meeting requested by ${m.userId}")
        if (m.userId.map(_ == meeting.owner).getOrElse(false)) {
          val stoppedMeeting = meeting.stop
          sendStopped(stoppedMeeting, users)
          context become stopped(stoppedMeeting)
        } else {
          // return error to user .. can't stop someone else's meeting
          sender ! Error(m, "You do not have permission to stop this meeting.")
        }
      case ReceiveTimeout =>
        sendStopped(meeting, users)
        self ! PoisonPill
    }
  }

  def stopped(meeting: Meeting): Receive = LoggingReceive {
    case JoinMeeting() =>
      Logger.info("Join Meeting while stopped")
      sender ! Stopped(meeting)
    case ReceiveTimeout =>
      self ! PoisonPill
  }

  // @todo become started or stopped depending on stopTime
  // start with a user to send back the Joined message immediately?
  def receive = started(initialMeeting, Set.empty)
}
