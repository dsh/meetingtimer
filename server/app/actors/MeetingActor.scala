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
class MeetingActor(bus: MeetingEventBus, initialMeeting: Meeting) extends Actor with ActorLogging {
  import actors.MeetingActor._
  import actors.UserActor._

  import scala.util.{Failure, Success}

  context.setReceiveTimeout(4 hours)

  /**
    * Broadcast a message to all users listening to this event.
    *
    * @param msg
    */
  def broadcast(msg: UserMessage) = {
    val topic = MeetingBroadcastTopic(initialMeeting.id)
    Logger.debug(s"MeetingActor: broadcast $msg to $topic")
    bus.publish(MeetingEvent(topic, msg))
  }

  /**
    * Subscribe and listen to events for me on the event bus.
    *
    * When we first join broadcast a Joined or Stopped message. Any users who got connected before the
    * meeting got started will get the details on the meeting.
    */
  override def preStart() {
    val topic = MeetingTopic(initialMeeting.id)
    Logger.debug(s"MeetingActor: subscribing to $topic")
    bus.subscribe(self, topic)
    // If we have a stop time, send a meeting stopped message out. Otherwise send out the joined meeting.
    broadcast(initialMeeting.stopTime.fold[UserMessage](Joined(initialMeeting))(_ => Stopped(initialMeeting)))
  }

  /**
    * Send a response to a specific user.
    *
    * If one user joins, we only send the Joined response back to that user.
    *
    * @param userId
    * @param msg
    */
  def publishToUser(userId: Option[String], msg: UserMessage) = {
    Logger.debug("MeetingActor: publishToUser")
    userId foreach { uid =>
      val topic = UserTopic(initialMeeting.id, uid)
      Logger.debug(s"MeetingActor: publish $msg to $topic")
      bus.publish(MeetingEvent(topic, msg))
    }
  }


  def receive = receiving(initialMeeting)

  def receiving(meeting: Meeting): Receive = LoggingReceive {
    case heartbeat: Heartbeat =>
      val touchedMeeting = meeting.touch
      Meetings.persist(touchedMeeting)
      context become receiving(touchedMeeting)
    case joinMeeting: JoinMeeting =>
      Logger.debug("MeetingActor: Join Meeting")
      publishToUser(joinMeeting.userId, Joined(meeting))
    case stopMeeting: StopMeeting =>
      Logger.debug(s"MeetingActor: Stop Meeting requested by ${stopMeeting.userId}")
      // We only allow the owner of the meeting to stop it.
      if (stopMeeting.userId.contains(meeting.owner)) {
        val stoppedMeeting = meeting.stop
        // Save to the data store that we've stopped the meeting.
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
