name := "magda-metadata"

lazy val commonSettings = Seq(
  organization := "au.csiro.data61",
  version := "0.1",
  scalaVersion := "2.11.12"
)

lazy val root = (project in file("."))
  .aggregate(common, searchApi, indexer, registryApi)
  .settings(commonSettings: _*)
lazy val common = (project in file("magda-scala-common"))
  .settings(commonSettings: _*)
lazy val searchApi = (project in file("magda-search-api"))
  .settings(commonSettings: _*)
  .dependsOn(common % "test->test;compile->compile")
  .enablePlugins(sbtdocker.DockerPlugin, JavaServerAppPackaging)
lazy val indexer = (project in file("magda-indexer"))
  .settings(commonSettings: _*)
  .dependsOn(common % "test->test;compile->compile")
  .enablePlugins(sbtdocker.DockerPlugin, JavaServerAppPackaging)
lazy val registryApi = (project in file("magda-registry-api"))
  .settings(commonSettings: _*)
  .dependsOn(common)
  .enablePlugins(sbtdocker.DockerPlugin, JavaServerAppPackaging)

EclipseKeys.withJavadoc := true
EclipseKeys.withSource := true
EclipseKeys.withBundledScalaContainers := false

Revolver.settings
Revolver.enableDebugging(port = 8000, suspend = false)

concurrentRestrictions in Global += Tags.limit(Tags.Test, 1)
sbt.Keys.fork in Test := false
