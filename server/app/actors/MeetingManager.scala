package actors

import actors.MeetingActor.StopMeeting
import actors.UserActor.Stopped
import akka.actor.ActorSystem
import com.google.inject.{AbstractModule, Inject}
import models.Meetings
import play.api.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

trait MeetingManager {
  def start(system: ActorSystem): Unit
}

/**
  * On startup get all the in-progress meetings and start a meeting actor for them.
  *
  * This is injected into our main Application controller so meetings start right away.
  *
  * @param bus
  */
class MeetingManagerImpl @Inject()(val bus: MeetingEventBus) extends MeetingManager {
  def start(system: ActorSystem) = {
    Logger.debug("MeetingManager: starting persisted meetings")
    Meetings.listInProgress foreach { meeting =>
      val meetingActorName= "meeting-" + meeting.id
      Logger.debug(s"MeetingManager: starting $meetingActorName")
      system.actorOf(MeetingActor.props(bus, meeting), name = meetingActorName)
    }
    system.scheduler.schedule(1 minute, 1 hour) {
      Logger.debug("MeetingManager: stopping old meetings")
      Meetings.needToStop foreach {meeting =>
        val stoppedMeeting = meeting.stop
        Logger.debug(s"MeetingManager: stopping old ${meeting.id}")
        // In case something is still listening, tell them to shut down.
        Meetings.persist(stoppedMeeting) onSuccess { case _ =>
          bus.publish(MeetingEvent(MeetingBroadcastTopic(meeting.id), Stopped(stoppedMeeting)))
          bus.publish(MeetingEvent(MeetingTopic(meeting.id), StopMeeting(Option(meeting.owner))))
        }
      }
    }
  }
}

class StartMeetingModule extends AbstractModule {
  def configure() = {
    bind(classOf[MeetingManager])
      .to(classOf[MeetingManagerImpl])
      // Force the meeting actors to start right away.
      .asEagerSingleton()
  }
}
