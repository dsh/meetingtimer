package controllers

import java.util.UUID

import actors.MeetingActor._
import actors.MeetingManagerActor.CreateMeeting
import actors.UserActor.{UserMessage, UserMessageJsonFormat}
import actors.{MeetingManagerActor, StartPersistedMeetings, UserActor}
import akka.actor.{ActorRef, ActorSystem}
import com.google.inject.Inject
import models.{Meeting, Meetings}
import play.api.Logger
import play.api.Play.current
import play.api.data.Forms._
import play.api.data._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints._
import play.api.i18n.{I18nSupport, MessagesApi}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json.Json
import play.api.mvc.WebSocket.FrameFormatter
import play.api.mvc._
import scala.concurrent.Future
import views.formdata.MeetingFormData



class Application @Inject() (val messagesApi: MessagesApi, val startMeetings: StartPersistedMeetings)
                            (system: ActorSystem)
  extends Controller with I18nSupport {

  startMeetings.start(system)

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

  def start = UserIdAction.async { implicit request =>
    meetingForm.bindFromRequest.fold(
      formWithErrors => {
        // @todo Return actionable error messages, not just this generic message.
        Future.successful(BadRequest("Invalid meeting data."))
      },
      meetingFormData => {
        val meeting = Meeting.fromFormData(meetingFormData, request.userId)
        Logger.info(s"Starting MeetingActor for meeting $meeting")
        Meetings.persist(meeting).map(_ => {
          if (meeting.stopTime.isEmpty) {
            meetingManager ! CreateMeeting(meeting)
          }
          Ok(Json.toJson(meeting))
        }).recover {
          case ex: Exception =>
            Logger.error(s"Error saving meeting in start: ${ex.getMessage}")
            Forbidden(s"Error starting meeting. Please try again later.")
        }
      }
    )
  }

  implicit val inEventFrameFormatter = FrameFormatter.jsonFrame[MeetingMessage]
  implicit val outEventFrameFormatter = FrameFormatter.jsonFrame[UserMessage]

  def meetingSocket(meetingId: String) = WebSocket.tryAcceptWithActor[MeetingMessage, UserMessage] { request =>
    Meetings.get(meetingId) map { meeting =>
      Right((out: ActorRef) => {
        Logger.info(s"Starting UserActor for meeting $meetingId")
        UserActor.props(meetingManager, meeting, request.session.get("userId"), out)
      })
    }
  }
}
