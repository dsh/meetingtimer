package controllers

import java.util.UUID

import actors.MeetingActor._
import actors.UserActor.{UserMessage, UserMessageJsonFormat}
import actors.{MeetingActor, MeetingEventBus, MeetingManager, UserActor}
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
import views.formdata.MeetingFormData

import scala.concurrent.Future


class Application @Inject() (val messagesApi: MessagesApi, val meetingManager: MeetingManager,
                             val bus: MeetingEventBus)(system: ActorSystem)
  extends Controller with I18nSupport {

  meetingManager.start(system)

  val meetingForm = Form(
    mapping(
      "name" -> nonEmptyText,
      "startTime" -> of[Double].verifying(min(0.0, strict=true)),
      "participants" -> number(min=1),
      "hourlyRate" -> bigDecimal
    )(MeetingFormData.apply)(MeetingFormData.unapply)
  )

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
      // We add a userId to the session. This identifies each user and allows primitive access control so they can
      // stop their own meetings.
      block(new UserIdRequest[A](userId, request)).map(_.withSession("userId" -> userId))
    }
  }


  def index(path: String) = Action {
    Ok(views.html.index())
  }


  /**
    * Start a new meeting.
    *
    * Reads data from the start form and starts a new meeting actor.
    *
    * @return Future[Response]
    */
  def start = UserIdAction.async { implicit request =>
    meetingForm.bindFromRequest.fold(
      formWithErrors => {
        Future.successful(BadRequest("Invalid meeting data."))
      },
      meetingFormData => {
        val meeting = Meeting.fromFormData(meetingFormData, request.userId)
        Logger.debug(s"start: Starting MeetingActor for meeting $meeting")
        Meetings.persist(meeting).map(_ => {
          if (meeting.stopTime.isEmpty) {
            system.actorOf(MeetingActor.props(bus, meeting))
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

  // Convert in/out data to/from json/meeting messages. Used for WebSocket below
  implicit val inEventFrameFormatter = FrameFormatter.jsonFrame[MeetingMessage]
  implicit val outEventFrameFormatter = FrameFormatter.jsonFrame[UserMessage]

  /**
    * Communicates meeting details to/from the user client.
    *
    * Clients send MeetingMessages to the meeting - operations such as Join and Stop.
    * The meeting will respond with UserMessages, such as Joined and Stopped, which contain details about the meeting.
    */
  def meetingSocket(meetingId: String) = WebSocket.tryAcceptWithActor[MeetingMessage, UserMessage] { request =>
    Meetings.get(meetingId) map { meeting =>
      Right((out: ActorRef) => {
        Logger.debug(s"meetingSocket: Starting UserActor for meeting $meetingId")
        UserActor.props(bus, meeting, getUserId(request.session), out)
      })
    }
  }
}
