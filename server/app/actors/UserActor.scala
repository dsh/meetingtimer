package actors

import akka.actor._
import akka.event.LoggingReceive
import models.Meeting
import play.api.Logger
import play.api.libs.json._
import scala.concurrent.duration._


object UserActor {
  def props(meetingManagerRef: ActorRef, meetingId: String, out: ActorRef) =
    Props(new UserActor(meetingManagerRef, meetingId, out))

  sealed trait UserMessage
  case class Joined(meeting: Meeting, stopTime: Option[Int]) extends UserMessage
  case class Stopped(timeElapsed: Int) extends UserMessage

  case class UserRegistered(meetingActorRef: ActorRef)

  // Convert user messages to JSON to send to the client
  implicit object UserMessageJsonFormat extends Format[UserMessage] {
    def writes(msg: UserMessage) = msg match {
      case Joined(meeting, stopTime) => Json.obj(
        "type" -> "JOINED_MEETING",
        "payload" -> Json.obj(
          "meeting" -> Json.obj(
            "id" -> meeting.id,
            "name" -> meeting.name,
            "startTime" -> meeting.startTime,
            "participants" -> meeting.participants,
            "hourlyRate" -> meeting.hourlyRate
          ),
          "stopTime" -> JsNull // stopTime.map { n => JsNumber(n) }.getOrElse(null)
        )
      )
      case Stopped(timeElapsed) => Json.obj(
        "type" -> "STOPPED_MEETING",
        "payload" -> timeElapsed
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

  // @todo make the timeout configurable
  context.setReceiveTimeout(4 hours)


  def receive = LoggingReceive {
    case UserRegistered(ref) => {
      meetingRef = Some(ref)
      ref ! JoinMeeting
    }
    // @todo if message is received before we finish registering we should queue these messages
    case msg: MeetingMessage => {
      Logger.info(s"User meeting message $msg")
      meetingRef.foreach ( _ ! msg )
    }
    case msg: UserMessage =>
      out ! msg
      msg match {
        case Stopped(_) => self ! PoisonPill
        case _ => ()
      }
    case ReceiveTimeout =>
      self ! PoisonPill
  }
}
