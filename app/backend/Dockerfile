# ===== STAGE 1 : Build Backend Spring Boot =====
# (Le frontend a son propre Dockerfile dans app/frontend/)
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# ===== STAGE 2 : Image finale =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copier le JAR backend
COPY --from=backend-build /app/target/student-management-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8089

ENTRYPOINT ["java", "-jar", "app.jar"]
