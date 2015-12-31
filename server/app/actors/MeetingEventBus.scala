package actors

import akka.event.{ActorEventBus, SubchannelClassification}
import akka.util.Subclassification
import com.google.inject.AbstractModule
import play.api.Logger

trait Message
sealed trait Topic {
  def meetingId: String
}
case class UserTopic(meetingId: String, userId: String) extends Topic
case class MeetingTopic(meetingId: String) extends Topic
case class MeetingBroadcastTopic(meetingId: String) extends Topic
case class MeetingEvent(topic: Topic, payload: Message)

trait MeetingEventBus extends ActorEventBus with SubchannelClassification {
  type Event = MeetingEvent
  type Classifier = Topic
}


/**
  * Meeting bus for meetings and users to communicate over.
  */
class MeetingEventBusImpl extends MeetingEventBus {

  override protected def classify(event: Event): Classifier = event.topic

  protected def subclassification = new Subclassification[Classifier] {
    def isEqual(x: Classifier, y: Classifier) = x == y
    def isSubclass(x: Classifier, y: Classifier) = {
      // They can only be a subclass if they have the same meeting id.
      if (x.meetingId != y.meetingId) false
      else {
        x match {
          // If the x type is broadcast, it is a subclass.
          case MeetingBroadcastTopic(_) => true
          // Otherwise they are only subclasses if they are equal.
          case _ => x == y
        }
      }
    }
  }

  override protected def publish(event: Event, subscriber: Subscriber): Unit = {
    Logger.debug(s"MeetingEventBus: publish - sending ${event.payload} to $subscriber")
    subscriber ! event.payload
  }
}

class MeetingEventBusModule extends AbstractModule {
  def configure() = {
    bind(classOf[MeetingEventBus])
      .to(classOf[MeetingEventBusImpl])
      // We only want one MeetingBus, and we want it right away.
      .asEagerSingleton()
  }
}
