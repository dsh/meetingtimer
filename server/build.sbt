import com.typesafe.sbt.packager.archetypes.ServerLoader

name := "meetingtimer"

version := "0.1"

lazy val `meetingtimer` = (project in file(".")).enablePlugins(PlayScala, JDebPackaging)

maintainer in Linux := "Dennis S. Hennen <dennis@28studios.com>"

packageSummary in Linux := "meetingtimer.io"

packageDescription := "Distributed meeting timer and cost calculator"

serverLoading in Debian := ServerLoader.SystemV


scalaVersion := "2.11.7"

libraryDependencies ++= Seq( jdbc , cache , ws , filters,  specs2 % Test )

unmanagedResourceDirectories in Test <+=  baseDirectory ( _ /"target/web/public/test" )

// Allow DI in controllers
routesGenerator := InjectedRoutesGenerator


// Disable documentation
sources in (Compile, doc) := Seq.empty

publishArtifact in (Compile, packageDoc) := false
