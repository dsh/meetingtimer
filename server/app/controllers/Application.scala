package controllers

import actors.MeetingActor._
import actors.MeetingManagerActor.CreateMeeting
import actors.UserActor.{UserMessageJsonFormat, UserMessage}
import actors.{MeetingManagerActor, UserActor}
import akka.actor.ActorSystem
import com.google.inject.Inject
import models.Meeting
import play.api.Play.current
import play.api.data.Forms._
import play.api.data._
import play.api.i18n.{I18nSupport, MessagesApi}
import play.api.libs.json.JsString
import play.api.mvc.WebSocket.FrameFormatter
import play.api.mvc._
import views.formdata.MeetingFormData
import play.api.Logger




class Application @Inject() (val messagesApi: MessagesApi) (system: ActorSystem)
  extends Controller with I18nSupport {

  val meetingForm = Form(
    mapping(
      "name" -> nonEmptyText,
      "startTime" -> number(min=0),
      "participants" -> number(min=1),
      "hourlyRate" -> number(min=0)
    )(MeetingFormData.apply)(MeetingFormData.unapply)
  )

  val meetingManager = system.actorOf(MeetingManagerActor.props())


  def start = Action { implicit request =>
    meetingForm.bindFromRequest.fold(
      formWithErrors => {
        ???
      },
      meetingFormData => {
        val meeting = Meeting.fromFormData(meetingFormData)
        Logger.info(s"Starting MeetingActor for meeting $meeting.id")
        meetingManager ! CreateMeeting(meeting)
        Ok(JsString(meeting.id))
      }
    )
  }

  implicit val inEventFrameFormatter = FrameFormatter.jsonFrame[MeetingMessage]
  implicit val outEventFrameFormatter = FrameFormatter.jsonFrame[UserMessage]

  def meetingSocket(meetingId: String) = WebSocket.acceptWithActor[MeetingMessage, UserMessage] { request => out =>
    // @todo abort if invalid meetingId
    Logger.info(s"Starting UserActor for meeting $meetingId")
    UserActor.props(meetingManager, meetingId, out)
  }

}
