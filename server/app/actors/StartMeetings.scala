package actors

import akka.actor.ActorSystem
import com.google.inject.{AbstractModule, Inject}
import models.Meetings
import play.api.Logger
import scala.concurrent.ExecutionContext.Implicits.global

trait StartMeetings {
  def start(system: ActorSystem): Unit
}

/**
  * On startup get all the in-progress meetings and start a meeting actor for them.
  *
  * This is injected into our main Application controller so meetings start right away.
  *
  * @param bus
  */
class StartPersistedMeetings @Inject() (val bus: MeetingEventBus) extends StartMeetings {
  def start(system: ActorSystem) = {
    Logger.debug("StartPersistedMeetings: starting persisted meetings")
    Meetings.listInProgress foreach { meeting =>
      val meetingActorName= "meeting-" + meeting.id
      Logger.debug(s"StartPersistedMeetings: starting $meetingActorName")
      system.actorOf(MeetingActor.props(bus, meeting), name = meetingActorName)
    }
  }
}

class StartMeetingModule extends AbstractModule {
  def configure() = {
    bind(classOf[StartMeetings])
      .to(classOf[StartPersistedMeetings])
      // Force the meeting actors to start right away.
      .asEagerSingleton()
  }
}
