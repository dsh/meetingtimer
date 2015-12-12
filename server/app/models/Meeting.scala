package models

import play.api.libs.json._
import play.api.libs.functional.syntax._
import views.formdata.MeetingFormData


case class Meeting(
  id: String,
  name: String,
  startTime: Int,
  participants: Int,
  hourlyRate: Int,
  stopTime: Option[Int] = None
) {
  def stop = {
    // If meeting was scheduled for the future and we stop before the meeting actually started,
    // set the stop time to the start time.
    val newStopTime = startTime max (System.currentTimeMillis / 1000).toInt
    this.copy(stopTime = Some(newStopTime))
  }
}

object Meeting {
  // We only want lower case characters, and we want to exclude characters that can be confused for each other
  // like the digit 1 and lower case L
  val SkipChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0o1li".toSet
  def genMeetingId = scala.util.Random.alphanumeric.filter( !SkipChars.contains(_) ).take(8).mkString
  def fromFormData(d: MeetingFormData) =
    apply(genMeetingId, d.name, d.startTime, d.participants, d.hourlyRate)
  implicit val meetingWrites: Writes[Meeting] = (
    (JsPath \ "id" ).write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "startTime").write[Int] and
    (JsPath \ "participants").write[Int] and
    (JsPath \ "hourlyRate").write[Int] and
    (JsPath \ "stopTime").write[Option[Int]]
  )(unlift(Meeting.unapply))
}
