package models

import play.api.Play
import play.api.db.slick.DatabaseConfigProvider
import play.api.libs.json._
import slick.driver.JdbcProfile
import slick.driver.MySQLDriver.api._
import views.formdata.MeetingFormData


case class Meeting(
  id: String,
  name: String,
  startTime: Double,
  participants: Int,
  hourlyRate: BigDecimal,
  stopTime: Option[Double] = None,
  owner: String
) {
  def stop = {
    // If meeting was scheduled for the future and we stop before the meeting actually started,
    // set the stop time to the start time.
    val newStopTime = startTime max (System.currentTimeMillis / 1000d)
    this.copy(stopTime = Some(newStopTime))
  }
}

object Meeting {
  // We only want lower case characters, and we want to exclude characters that can be confused for each other
  // like the digit 1 and lower case L
  val SkipChars = "abcdefghijklmnopqrstuvwxyz0O1LI".toSet
  def genMeetingId = scala.util.Random.alphanumeric.filter( !SkipChars.contains(_) ).take(8).mkString
  def fromFormData(d: MeetingFormData, owner: String) =
    apply(genMeetingId, d.name, d.startTime, d.participants, d.hourlyRate, None, owner)
  implicit val meetingWrites = new Writes[Meeting] {
    def writes(meeting: Meeting) = {
      Json.obj(
        "id" -> meeting.id,
        "name" -> meeting.name,
        "startTime" -> meeting.startTime,
        "participants" -> meeting.participants,
        "hourlyRate" -> meeting.hourlyRate,
        "stopTime" -> meeting.stopTime
      )
    }
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

  override def * =
    (id, name, startTime, participants, hourlyRate, stopTime, owner) <> ((Meeting.apply _).tupled, Meeting.unapply)
}



object Meetings {

  val dbConfig = DatabaseConfigProvider.get[JdbcProfile](Play.current)
  val meetings = TableQuery[MeetingTableDef]

  def persist(meeting: Meeting) = dbConfig.db.run(meetings.insertOrUpdate(meeting))
}
