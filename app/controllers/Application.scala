package controllers

import actors.UserActor
import com.google.inject.Inject
import models.Meeting
import play.api.i18n.{MessagesApi, I18nSupport}
import play.api.Play.current
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import views.formdata.MeetingFormData


class Application @Inject() (val messagesApi: MessagesApi) extends Controller with I18nSupport {

  val meetingForm = Form(
    mapping(
      "name" -> nonEmptyText,
      "startTime" -> number(min=0),
      "participants" -> number(min=1),
      "hourlyRate" -> number(min=0)
    )(MeetingFormData.apply)(MeetingFormData.unapply)
  )



  def index = Action {
    Ok(views.html.index(meetingForm))
  }

  def start = Action { implicit request =>
    meetingForm.bindFromRequest.fold(
      formWithErrors => {
        BadRequest(views.html.index(formWithErrors))
      },
      meetingFormData => {
        val meeting = Meeting(meetingFormData)
        Redirect(routes.Application.m(meeting.id))
      }
    )
  }

  def m(meetingId: String) = WebSocket.acceptWithActor[String, String] { request => out =>
    UserActor.props(out)
  }

}
