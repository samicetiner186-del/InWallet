# Aşama 1: Build
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw dependency:go-offline -q
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Aşama 2: Run (standart imaj)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Sadece ana jar dosyasını kopyaladığımızdan emin olalım
COPY --from=builder /app/target/ai-assistant-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
