package actors

import akka.actor._
import akka.event.LoggingReceive
import models.{Meeting, Meetings}
import play.api.Logger
import play.api.libs.json._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

object MeetingActor {
  def props(bus: MeetingEventBus, meeting: Meeting): Props = Props(classOf[MeetingActor], bus, meeting)

  sealed trait MeetingMessage extends Message {
    def userId: Option[String]
    def withUserId(newUserId: String): MeetingMessage
  }
  case class JoinMeeting(userId: Option[String] = None) extends MeetingMessage {
    def withUserId(newUserId: String) = this.copy(userId = Option(newUserId))
  }
  case class StopMeeting(userId: Option[String] = None) extends MeetingMessage {
    override def withUserId(newUserId: String) = this.copy(userId = Option(newUserId))
  }
  case class Heartbeat(userId: Option[String] = None) extends MeetingMessage {
    override def withUserId(newUserId: String) = this.copy(userId = Option(newUserId))
  }

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
class MeetingActor(bus: MeetingEventBus, meeting: Meeting) extends Actor with ActorLogging {
  import actors.MeetingActor._
  import actors.UserActor._

  import scala.util.{Failure, Success}

  context.setReceiveTimeout(4 hours)

  def broadcast(msg: UserMessage) = {
    val topic = MeetingBroadcastTopic(meeting.id)
    Logger.debug(s"MeetingActor: broadcast $msg to $topic")
    bus.publish(MeetingEvent(topic, msg))
  }

  override def preStart() {
    val topic = MeetingTopic(meeting.id)
    Logger.debug(s"MeetingActor: subscribing to $topic")
    bus.subscribe(self, topic)
    // If we have a stop time, send a meeting stopped message out. Otherwise send out the joined meeting.
    broadcast(meeting.stopTime.fold[UserMessage](Joined(meeting))(_ => Stopped(meeting)))
  }

  def publishToUser(userId: Option[String], msg: UserMessage) = {
    Logger.debug("MeetingActor: publishToUser")
    userId foreach { uid =>
      val topic = UserTopic(meeting.id, uid)
      Logger.debug(s"MeetingActor: publish $msg to $topic")
      bus.publish(MeetingEvent(topic, msg))
    }
  }


  def receive = LoggingReceive {
    case joinMeeting: JoinMeeting =>
      Logger.debug("MeetingActor: Join Meeting")
      publishToUser(joinMeeting.userId, Joined(meeting))
    case stopMeeting: StopMeeting =>
      Logger.debug(s"MeetingActor: Stop Meeting requested by ${stopMeeting.userId}")
      if (stopMeeting.userId.contains(meeting.owner)) {
        val stoppedMeeting = meeting.stop
        Meetings.persist(stoppedMeeting) onComplete {
          case Success(_) =>
            broadcast(Stopped(stoppedMeeting))
            self ! PoisonPill
          case Failure(ex) =>
            publishToUser(stopMeeting.userId, Error(stopMeeting, ex.getMessage))
        }
      } else {
        // return error to user .. can't stop someone else's meeting
        publishToUser(stopMeeting.userId, Error(stopMeeting, "You do not have permission to stop this meeting."))
      }
    case ReceiveTimeout =>
      val stoppedMeeting = meeting.stop
      Meetings.persist(stoppedMeeting)
      broadcast(Stopped(stoppedMeeting))
      self ! PoisonPill
  }
}
