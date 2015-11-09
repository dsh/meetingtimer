package actors

import akka.actor._


object UserActor {
  def props(out: ActorRef) = Props(new UserActor(out))
}

class UserActor(out: ActorRef) extends Actor {
  def receive = {
    case msg: String =>
      out ! ("I received your message: " + msg)
  }
}
