package actors

import actors.UserActor.Joined
import akka.actor._
import models.Meeting


object UserActor {
  def props(out: ActorRef) = Props(new UserActor(out))

  trait UserMessage
  case class Joined(meeting: Meeting) extends UserMessage
  case class Stopped(timeElapsed: Int) extends UserMessage
}

class UserActor(out: ActorRef) extends Actor with ActorLogging {

  def receive = {
    case msg: String =>
      out ! ("I received your message: " + msg)
    case Joined(m) =>
      out ! Joined(m)
  }
}
