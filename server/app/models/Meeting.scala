package models

import play.api.libs.json._
import play.api.libs.functional.syntax._
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
  implicit val meetingWrites: Writes[Meeting] = (
    (JsPath \ "id" ).write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "startTime").write[Double] and
    (JsPath \ "participants").write[Int] and
    (JsPath \ "hourlyRate").write[BigDecimal] and
    (JsPath \ "stopTime").write[Option[Double]] and
      // @todo !!! IMPORTANT !!! Do not send the Owner!! Otherwise they can spoof and stop a meeting.
    (JsPath \ "owner").write[String]
    )(unlift(Meeting.unapply))
}
