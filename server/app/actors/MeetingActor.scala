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
class MeetingActor(meeting: Meeting) extends Actor with ActorLogging {


  import actors.MeetingActor._
  import actors.UserActor._

  // To cluster I would use a pub/sub and make each meeting a "topic".
  // Users would subscribe to the meeting topic for updates.
  var users = Set[ActorRef]()
  var stopTime: Option[Int] = None

  // @todo need a heartbeat from clients to this from triggering.
  context.setReceiveTimeout(4 hours)

  // @todo need to inject this so we can unit test\
  def getNow = (System.currentTimeMillis / 1000).toInt

  def receive = LoggingReceive {
    case JoinMeeting() =>
      Logger.info("Join Meeting")
      users += sender
      context watch sender
      sender ! Joined(meeting, stopTime)
    case StopMeeting() =>
      Logger.info("Stop Meeting")
      val now = getNow
      // If meeting was scheduled for the future and we stop before the meeting actually started,
      // set the stop time to the start time.
      val stopTimeActual = meeting.startTime max now
      stopTime = Some(stopTimeActual)
      users foreach { _ ! Stopped(meeting.startTime - stopTimeActual) }
    case Terminated(user) =>
      users -= user
    case ReceiveTimeout =>
      self ! PoisonPill
  }
}
