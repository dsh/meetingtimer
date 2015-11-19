name := "meetingtimer"

version := "1.0"

lazy val `meetingtimer` = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.7"

libraryDependencies ++= Seq( jdbc , cache , ws   , specs2 % Test )

libraryDependencies ++= Seq(
  "org.webjars" %% "webjars-play" % "2.4.0-1",
  "org.webjars" % "jquery" % "1.11.3",
  "org.webjars" % "react" % "0.14.2"
)

unmanagedResourceDirectories in Test <+=  baseDirectory ( _ /"target/web/public/test" )

// Allow DI in controllers
routesGenerator := InjectedRoutesGenerator
