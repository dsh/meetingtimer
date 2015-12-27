package actors

import akka.actor._
import akka.event.LoggingReceive
import models.{Meetings, Meeting}
import play.api.Logger
import play.api.libs.json._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global

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
  import scala.util.{Success, Failure}

  def sendStopped(m: Meeting, us: Set[ActorRef]) = us foreach { _ ! Stopped(m) }

  context.setReceiveTimeout(4 hours)

  def started(meeting: Meeting, users: Set[ActorRef]): Receive = LoggingReceive {
    case JoinMeeting() =>
      Logger.info("Join Meeting")
      context watch sender
      sender ! Joined(meeting)
      context become started(meeting, users + sender)
    case Terminated(user) =>
      context become started(meeting, users - user)
    case stopMeeting: StopMeeting =>
      Logger.info(s"Stop Meeting requested by ${stopMeeting.userId}")
      if (stopMeeting.userId.contains(meeting.owner)) {
        val stoppedMeeting = meeting.stop
        val origin = sender // sender will be gone when future below returns
        Meetings.persist(stoppedMeeting) onComplete {
          case Success(_) =>
            sendStopped(stoppedMeeting, users)
            self ! PoisonPill
          case Failure(ex) =>
            origin ! Error(stopMeeting, ex.getMessage)
        }
      } else {
        // return error to user .. can't stop someone else's meeting
        sender ! Error(stopMeeting, "You do not have permission to stop this meeting.")
      }
    case ReceiveTimeout =>
      val stoppedMeeting = meeting.stop
      Meetings.persist(stoppedMeeting)
      sendStopped(stoppedMeeting, users)
      self ! PoisonPill
  }

  def receive = started(initialMeeting, Set.empty)
}
