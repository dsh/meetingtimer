package actors

import actors.MeetingActor._
import akka.actor._
import akka.event.LoggingReceive
import models.Meeting
import play.api.Logger
import play.api.libs.json._
import scala.concurrent.duration._


object UserActor {
  def props(meetingManagerRef: ActorRef, meetingId: String, userId: Option[String], out: ActorRef) =
    Props(new UserActor(meetingManagerRef, meetingId, userId, out))

  // Messages we send to users.
  sealed trait UserMessage
  case class Joined(meeting: Meeting) extends UserMessage
  case class Stopped(meeting: Meeting) extends UserMessage
  case class Error(meetingMessage: MeetingMessage, message: String) extends UserMessage

  case class UserRegistered(meetingActorRef: ActorRef)

  val JoinedMeetingActionType = "JOINED_MEETING"
  val StoppedMeetingActionType = "STOPPED_MEETING"
  val ErrorActionType = "ERROR"

  // Convert user messages to JSON to send to the client
  implicit object UserMessageJsonFormat extends Format[UserMessage] {
    // facebook standard action format
    def fsa(theType: String, payload: Any): JsObject = {
      val jsonPayload: JsValue = payload match {
        // Error include the action type that triggered the error.
        case e: Error => Json.obj(
          "actionType" -> (e.meetingMessage match {
            case JoinMeeting() => JoinMeetingActionType
            case StopMeeting(_) => StopMeetingActionType
            case _ => JsNull
          }),
          "message" -> e.message
        )
        case m: Meeting => Json.toJson(m)
        case _ => JsNull
      }
      val error = payload match {
        case Error => true
        case _ => false
      }
      Json.obj(
        "type" -> theType,
        "payload" -> jsonPayload,
        "error" -> error
      )
    }
    def writes(msg: UserMessage) = msg match {
      case Joined(meeting) => fsa(JoinedMeetingActionType, meeting)
      case Stopped(meeting) => fsa(StoppedMeetingActionType, meeting)
      case e: Error => fsa(ErrorActionType, e)

    }
    // We never read user messages from the client. We need this implemented, though, so
    // we can create the frame formatters for WebSocket.acceptWithActor.
    def reads(json: JsValue) = JsError()
  }
}

class UserActor(meetingManagerRef: ActorRef, meetingId: String, userId: Option[String], out: ActorRef) extends Actor
  with ActorLogging
  with Stash {
  import actors.UserActor._
  import actors.MeetingActor._
  import actors.MeetingManagerActor.RegisterUser

  override def preStart() = meetingManagerRef ! RegisterUser(meetingId, self)

  // @todo make the timeout configurable
  context.setReceiveTimeout(4 hours)

  def receive = LoggingReceive {
    case UserRegistered(meetingRef) => {
      context become normalReceive(meetingRef)
      unstashAll()
    }
    case ReceiveTimeout => self ! PoisonPill
    case _ => stash()
  }


  def normalReceive(meetingRef: ActorRef) = LoggingReceive {
    case msg: MeetingMessage => {
      Logger.info(s"User meeting message $msg")
      meetingRef ! msg.withUserId(userId)
    }
    case msg: UserMessage =>
      out ! msg
      msg match {
        case Stopped(_) => self ! PoisonPill
        case _ => ()
      }
    case ReceiveTimeout => self ! PoisonPill
  }
}
