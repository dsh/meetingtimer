package actors

import akka.actor.ActorSystem
import com.google.inject.{AbstractModule, ImplementedBy}
import models.Meetings
import play.api.Logger
import scala.concurrent.ExecutionContext.Implicits.global


@ImplementedBy(classOf[StartPersistedMeetings])
trait StartMeetings {
  def start(system: ActorSystem): Unit
}

class StartPersistedMeetings /* @Inject() (val bus: MeetingEventBus) */ extends StartMeetings {
  def start(system: ActorSystem) = {
    Logger.debug("StartPersistedMeetings: starting persisted meetings")
    Meetings.listInProgress foreach { meeting =>
      val meetingActorName= "meeting-" + meeting.id
      Logger.debug(s"StartPersistedMeetings: starting $meetingActorName")
      // system.actorOf(MeetingActor.props(bus, meeting), name = meetingActorName)
    }
  }
}

class StartMeetingModule extends AbstractModule {
  def configure() = {
    bind(classOf[StartMeetings])
      .to(classOf[StartPersistedMeetings])
      .asEagerSingleton
  }
}
