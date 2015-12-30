package actors

import actors.MeetingActor._
import akka.actor._
import akka.event.LoggingReceive
import models.Meeting
import play.api.Logger
import play.api.libs.json._

import scala.concurrent.duration._


object UserActor {
  def props(bus: MeetingEventBus, initialMeeting: Option[Meeting], userId: String, out: ActorRef) =
    Props(new UserActor(bus, initialMeeting, userId, out))

  // Messages we send to users.
  sealed trait UserMessage extends Message
  case class Joined(meeting: Meeting) extends UserMessage
  case class Stopped(meeting: Meeting) extends UserMessage
  // Error.meetingMessage is the message that triggered the error.
  case class Error(meetingMessage: MeetingMessage, message: String) extends UserMessage

  case class UserRegistered(meetingActorRef: ActorRef)

  val JoinedMeetingActionType = "JOINED_MEETING"
  val StoppedMeetingActionType = "STOPPED_MEETING"
  val ErrorActionType = "ERROR"

  // Convert user messages to JSON to send to the client
  implicit object UserMessageJsonFormat extends Format[UserMessage] {
    // facebook standard action format
    def fsa(theType: String, payload: JsValue, error: Boolean = false): JsObject = {
      Json.obj(
        "type" -> theType,
        "payload" -> payload,
        "error" -> error
      )
    }
    def writes(msg: UserMessage) = msg match {
      case Joined(meeting) => fsa(JoinedMeetingActionType, Json.toJson(meeting))
      case Stopped(meeting) => fsa(StoppedMeetingActionType, Json.toJson(meeting))
      case e: Error => fsa(ErrorActionType, Json.obj(
        "actionType" -> (e.meetingMessage match {
          case JoinMeeting(_) => JoinMeetingActionType
          case StopMeeting(_) => StopMeetingActionType
          case _ => JsNull
        }),
        "message" -> e.message
      ), error = true)
    }
    // We never read user messages from the client. We need this implemented, though, so
    // we can create the frame formatters for WebSocket.acceptWithActor.
    def reads(json: JsValue) = JsError()
  }
}

class UserActor(bus: MeetingEventBus, initialMeeting: Option[Meeting], userId: String, out: ActorRef)
  extends Actor with ActorLogging {
  import actors.MeetingActor._
  import actors.UserActor._

  // @todo make the timeout configurable
  context.setReceiveTimeout(4 hours)

  val receive = initialMeeting match {
    case None =>
      Logger.debug("UserActor: start - No such meeting")
      out ! Error(JoinMeeting(), "Valid meeting ID required.")
      self ! PoisonPill
      stopping
    case Some(meeting) if meeting.stopTime.isDefined =>
      Logger.debug("UserActor: start - Meeting is stopped")
      out ! Stopped(meeting)
      self ! PoisonPill
      stopping
    case Some(meeting) =>
      Logger.debug("UserActor: start - Meeting in progress")
      bus.subscribe(self, UserTopic(meeting.id, userId))
      normalReceive(meeting)
  }


  def normalReceive(meeting: Meeting) = {
    LoggingReceive {
      case msg: MeetingMessage =>
        // Logger.debug(s"User meeting message $msg")
        // Events come from the user without the userId attached. Here we attach them so the meeting
        // knows who to send responses back to.
        Logger.debug(s"UserActor: Received meeting message $msg")
        bus.publish(MeetingEvent(MeetingTopic(meeting.id), msg.withUserId(userId)))
      case msg: UserMessage =>
        Logger.debug(s"UserActor: Forwarding message to user $msg")
        out ! msg
        msg match {
          case Stopped(_) => self ! PoisonPill
          case _ => ()
        }
      case ReceiveTimeout => self ! PoisonPill
    }
  }

  def stopping = Actor.emptyBehavior

}
