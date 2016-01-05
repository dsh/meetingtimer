package models

import com.google.inject.name.{Names, Named}
import com.google.inject.{AbstractModule, Inject}
import play.api.{Environment, Configuration, Play}
import play.api.db.slick.DatabaseConfigProvider
import play.api.libs.json._
import slick.driver.JdbcProfile
import slick.driver.MySQLDriver.api._
import views.formdata.MeetingFormData

import scala.concurrent.duration._


class MeetingModule(environment: Environment, configuration: Configuration) extends AbstractModule {
  def configure() = {
    val config = configuration.getConfig("meetingtimer").getOrElse(Configuration.empty)
    bind(classOf[String])
      .annotatedWith(Names.named("host"))
      .toInstance(config.getString("host").getOrElse(""))
    bind(classOf[String])
      .annotatedWith(Names.named("socketHost"))
      .toInstance(config.getString("socketHost").getOrElse("ws://"))
    bind(classOf[MeetingInjector]).toInstance(Meeting)
  }
}


case class Meeting(
  id: String,
  name: String,
  startTime: Double,
  participants: Int,
  hourlyRate: BigDecimal,
  stopTime: Option[Double] = None,
  owner: String,
  lastTouched: Option[Double]
) {
  lazy val linkToView = Meeting.host + "/m/" + id
  lazy val linkToOpen = Meeting.socketHost + "/meeting-socket/" + id
  def currentTime = System.currentTimeMillis / 1000d
  def stop = {
    // If meeting was scheduled for the future and we stop before the meeting actually started,
    // set the stop time to the start time.
    val newStopTime = startTime max currentTime
    this.copy(stopTime = Option(newStopTime))
  }
  def touch = this.copy(lastTouched = Option(currentTime))
}

trait MeetingInjector {
  @Inject @Named("host") val host: String = ""
  @Inject @Named("socketHost") val socketHost: String = ""
}

object Meeting extends MeetingInjector {

  // We only want lower case characters, and we want to exclude characters that can be confused for each other
  // like the digit 1 and lower case L
  val SkipChars = "abcdefghijklmnopqrstuvwxyz0O1LI".toSet

  def genMeetingId = scala.util.Random.alphanumeric.filter(!SkipChars.contains(_)).take(8).mkString

  def fromFormData(d: MeetingFormData, owner: String) =
    apply(genMeetingId, d.name, d.startTime, d.participants, d.hourlyRate, None, owner, None)

  implicit object MeetingWrites extends Writes[Meeting] {
    def writes(m: Meeting) = Json.obj(
      "id" -> m.id,
      "name" -> m.name,
      "startTime" -> m.startTime,
      "participants" -> m.participants,
      "hourlyRate" -> m.hourlyRate,
      "stopTime" -> m.stopTime,
      "owner" -> m.owner,
      "lastTouched" -> m.lastTouched,
      "_links" -> Json.obj(
        "view" -> m.linkToView,
        "open" -> m.linkToOpen
      )
    )
  }
}



class MeetingTableDef(tag: Tag) extends Table[Meeting](tag, "meetings") {

  def id = column[String]("id", O.PrimaryKey)
  def name = column[String]("name")
  def startTime = column[Double]("startTime")
  def participants = column[Int]("participants")
  def hourlyRate = column[BigDecimal]("hourlyRate")
  def stopTime = column[Option[Double]]("stopTime")
  def owner = column[String]("owner")
  def lastTouched = column[Option[Double]]("lastTouched")

  override def * =
    (id, name, startTime, participants, hourlyRate, stopTime, owner, lastTouched) <> ((Meeting.apply _).tupled, Meeting.unapply)
}



object Meetings {

  val db = DatabaseConfigProvider.get[JdbcProfile](Play.current).db
  val meetings = TableQuery[MeetingTableDef]

  val meetingThreshold = 4 hours
  def oldMeetingThresholdSeconds: Double = System.currentTimeMillis / 1000d - meetingThreshold.toSeconds

  def persist(meeting: Meeting) = db.run(meetings.insertOrUpdate(meeting))
  def get(meetingId: String) = db.run(meetings.filter(_.id === meetingId).result.headOption)
  def myMeetings(owner: String) = db.run(meetings.filter(_.owner === owner).sortBy(_.startTime).result)
  def listInProgress = {
    val q = meetings
      // only meetings that are not stopped
      .filter(_.stopTime.isEmpty)
      // only meetings that are not older than our meeting threshold
      .filter(m => m.lastTouched.isEmpty || m.lastTouched > oldMeetingThresholdSeconds)
    db.stream(q.result)
  }
  def needToStop = {
    val threshold = oldMeetingThresholdSeconds
    val now = System.currentTimeMillis / 1000d
    val q = meetings
      // only meetings that are not stopped
      .filter(_.stopTime.isEmpty)
      // only meetings that ARE older than our meeting threshold
      .filter(m =>
        (m.lastTouched.isDefined && m.lastTouched <= oldMeetingThresholdSeconds) ||
        (m.lastTouched.isEmpty && m.startTime <= oldMeetingThresholdSeconds))
    db.stream(q.result)
  }
}
