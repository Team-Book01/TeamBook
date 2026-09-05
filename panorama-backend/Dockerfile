FROM gradle:8.5-jdk21 AS panorama
WORKDIR /panoramabuild
COPY ./build.gradle ./settings.gradle .
RUN gradle dependencies --no-daemon
COPY ./src ./src
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /my-libs
COPY --from=panorama /panoramabuild/build/libs/*.jar panorama.jar
CMD ["java", "-jar", "panorama.jar"]