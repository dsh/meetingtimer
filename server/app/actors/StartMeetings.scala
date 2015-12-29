package actors

import akka.actor.ActorSystem
import com.google.inject.name.Names
import com.google.inject.{AbstractModule, ImplementedBy}
import models.Meetings
import play.api.Logger
import scala.concurrent.ExecutionContext.Implicits.global

@ImplementedBy(classOf[StartPersistedMeetings])
trait StartMeetings {
  def start(system: ActorSystem): Unit
}

class StartPersistedMeetings extends StartMeetings {
  def start(system: ActorSystem) = {
    Logger.info("starting persisted meetings")
    Meetings.listInProgress foreach { meeting =>
      val meetingActorName= "meeting-" + meeting.id
      Logger.info(s"starting $meetingActorName")
      system.actorOf(MeetingActor.props(meeting), name = meetingActorName)
    }
  }
}

class StartMeetingModule extends AbstractModule {
  def configure() = {
    bind(classOf[StartMeetings])
      .annotatedWith(Names.named("persisted"))
      .to(classOf[StartPersistedMeetings])
      .asEagerSingleton
  }
}
