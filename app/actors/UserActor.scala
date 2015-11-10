package actors

import akka.actor._
import akka.event.LoggingReceive
import models.Meeting
import play.api.libs.json.{JsError, JsValue, Json, Format}


object UserActor {
  def props(meetingManagerRef: ActorRef, meetingId: String, out: ActorRef) =
    Props(new UserActor(meetingManagerRef, meetingId, out))

  trait UserMessage
  case class Joined(meeting: Meeting) extends UserMessage
  case class Stopped(timeElapsed: Int) extends UserMessage

  case class UserRegistered(meetingActorRef: ActorRef)

  // Convert user messages to JSON to send to the client
  implicit object UserMessageFormat extends Format[UserMessage] {
    def writes(msg: UserMessage) = msg match {
      case Joined(meeting) => Json.obj(
        "event" -> "joined",
        "meeting" -> Json.obj(
          "id" -> meeting.id,
          "name" -> meeting.name,
          "startTime" -> meeting.startTime,
          "participants" -> meeting.participants,
          "hourlyRate" -> meeting.hourlyRate
        )
      )
      case Stopped(timeElapsed) => Json.obj(
        "event" -> "stopped",
        "timeElapsed" -> timeElapsed
      )
    }
    def reads(json: JsValue) = JsError()
  }
}

class UserActor(meetingManagerRef: ActorRef, meetingId: String, out: ActorRef) extends Actor with ActorLogging {
  import actors.UserActor._
  import actors.MeetingActor._
  import actors.MeetingManagerActor.RegisterUser

  var meetingRef: Option[ActorRef] = None

  override def preStart() = meetingManagerRef ! RegisterUser(meetingId, self)

  def receive = LoggingReceive {
    case UserRegistered(ref) => {
      meetingRef = Some(ref)
      ref ! JoinMeeting
    }
    // @todo if message is received before we finish registering we should queue these messages
    case msg: MeetingMessage => meetingRef.foreach ( _ ! msg )
    case msg: UserMessage =>
      out ! msg
      msg match {
        case Stopped(_) => self ! PoisonPill
        case _ => ()
      }
  }
}
