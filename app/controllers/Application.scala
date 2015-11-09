package controllers

import com.google.inject.Inject
import play.api.i18n.{MessagesApi, I18nSupport}
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._

case class MeetingData(name: String, start_time: Int, participants: Int, hourly_rate: Int)


class Application @Inject() (val messagesApi: MessagesApi) extends Controller with I18nSupport {

  val meetingForm = Form(
    mapping(
      "name" -> nonEmptyText,
      "start_time" -> number(min=0),
      "participants" -> number(min=1),
      "hourly_rate" -> number(min=0)
    )(MeetingData.apply)(MeetingData.unapply)
  )



  def index = Action {
    Ok(views.html.index(meetingForm))
  }

  def start = Action { implicit request =>
    meetingForm.bindFromRequest.fold(
      formWithErrors => {
        // binding failure, you retrieve the form containing errors:
        BadRequest(views.html.index(formWithErrors))
      },
      userData => {
        /* binding success, you get the actual value. */
        // val newUser = models.User(userData.name, userData.age)
        // val id = models.User.create(newUser)
        val meetingId = "abc123"
        Redirect(routes.Application.m(meetingId))
      }

    )
  }

  def m(meetingId: String) = TODO
}
