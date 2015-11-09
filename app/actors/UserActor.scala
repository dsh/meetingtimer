package actors

import akka.actor._
import models.Meeting


object UserActor {
  def props(meetingManagerRef: ActorRef, meetingId: String, out: ActorRef) =
    Props(new UserActor(meetingManagerRef, meetingId, out))

  trait UserMessage
  case class Joined(meeting: Meeting) extends UserMessage
  case class Stopped(timeElapsed: Int) extends UserMessage

  case class UserRegistered(meetingActorRef: ActorRef)
}

class UserActor(meetingManagerRef: ActorRef, meetingId: String, out: ActorRef) extends Actor with ActorLogging {
  import actors.UserActor._
  import actors.MeetingActor._
  import actors.MeetingManagerActor.RegisterUser

  var meetingRef: Option[ActorRef] = None

  override def preStart() = meetingManagerRef ! RegisterUser(meetingId, self)

  def receive = {
    case UserRegistered(ref) => meetingRef = Some(ref)
    // @todo if message is received before we finish registering we should queue these messages
    case msg: MeetingMessage => meetingRef.foreach ( _ ! msg )
    case msg: UserMessage =>
      out ! msg
      msg match {
        // @todo or should this send an EOF?
        case Stopped(_) => context stop self
      }
  }
}
