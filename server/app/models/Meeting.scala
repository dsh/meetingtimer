package models

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
  val SkipChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0o1lIi".toSet
  def genMeetingId = scala.util.Random.alphanumeric.filter( !SkipChars.contains(_) ).take(8).mkString
  def apply(d: MeetingFormData): Meeting =
    Meeting(genMeetingId, d.name, d.startTime, d.participants, d.hourlyRate)
}
