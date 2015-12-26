package controllers

import java.util.UUID
import actors.MeetingActor._
import actors.MeetingManagerActor.CreateMeeting
import actors.UserActor.{UserMessage, UserMessageJsonFormat}
import actors.{MeetingManagerActor, UserActor}
import akka.actor.ActorSystem
import com.google.inject.Inject
import models.Meeting
import play.api.Logger
import play.api.Play.current
import play.api.data.Forms._
import play.api.data._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints._
import play.api.i18n.{I18nSupport, MessagesApi}
import play.api.libs.json.Json
import play.api.mvc.WebSocket.FrameFormatter
import play.api.mvc._
import views.formdata.MeetingFormData
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global


class Application @Inject() (val messagesApi: MessagesApi) (system: ActorSystem)
  extends Controller with I18nSupport {

  val meetingForm = Form(
    mapping(
      "name" -> nonEmptyText,
      "startTime" -> of[Double].verifying(min(0.0, strict=true)),
      "participants" -> number(min=1),
      "hourlyRate" -> bigDecimal
    )(MeetingFormData.apply)(MeetingFormData.unapply)
  )

  val meetingManager = system.actorOf(MeetingManagerActor.props())

  /**
    * Get the user's id from the session, or create one if none exists.
    *
    * @param session Session to check for userId
    * @return userId
    */
  def getUserId(session: Session) = session.get("userId").getOrElse(UUID.randomUUID.toString)


  /**
    * Adds userId to the request, generating one if needed, always saving it to the session (cookie).
    *
    * @param userId
    * @param request
    * @tparam A
    */
  class UserIdRequest[A](val userId: String, request: Request[A]) extends WrappedRequest[A](request)
  object UserIdAction extends ActionBuilder[UserIdRequest]  {
    def invokeBlock[A](request: Request[A], block: (UserIdRequest[A]) => Future[Result]) = {
      val userId = getUserId(request.session)
      block(new UserIdRequest[A](userId, request)).map(_.withSession("userId" -> userId))
    }
  }

  def start = UserIdAction { implicit request =>
    meetingForm.bindFromRequest.fold(
      formWithErrors => {
        ???
      },
      meetingFormData => {
        val meeting = Meeting.fromFormData(meetingFormData, request.userId)
        Logger.info(s"Starting MeetingActor for meeting $meeting.id")
        meetingManager ! CreateMeeting(meeting)
        Ok(Json.toJson(meeting))
      }
    )
  }

  implicit val inEventFrameFormatter = FrameFormatter.jsonFrame[MeetingMessage]
  implicit val outEventFrameFormatter = FrameFormatter.jsonFrame[UserMessage]

  def meetingSocket(meetingId: String) = WebSocket.acceptWithActor[MeetingMessage, UserMessage] { request => out =>
    // @todo abort if invalid meetingId
    Logger.info(s"Starting UserActor for meeting $meetingId")
    UserActor.props(meetingManager, meetingId, request.session.get("userId"), out)
  }
}
