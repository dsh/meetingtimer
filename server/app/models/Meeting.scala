package models

import views.formdata.MeetingFormData


case class Meeting(id: String, name: String, startTime: Int, participants: Int, hourlyRate: Int)

object Meeting {
  def genMeetingId = scala.util.Random.alphanumeric.take(8).mkString
  def apply(d: MeetingFormData): Meeting =
    Meeting(genMeetingId, d.name, d.startTime, d.participants, d.hourlyRate)
}
