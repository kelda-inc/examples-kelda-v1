### Development

1. Start the compiler
```
$ sbt "~search-api:stage"
```

It'll watch the filesystem for changes, and build the application JAR in
`magda-search-api/target/universal/stage`.

2. Start `kelda dev`
```
$ kelda dev magda-search-api
```

It'll sync the JAR built by `sbt` into a Java container.

### Building
```
$ SBT_OPTS="-Dversion=0.0.50-0" npm run docker-build-prod
```
