# ============================================================
# STAGE 1: Maven Build
# ============================================================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /build

# Copy POM and download dependencies first (leverage Docker layer caching)
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress

# Copy source and build
COPY backend/src ./src
RUN mvn clean package -DskipTests -B --no-transfer-progress

# ============================================================
# STAGE 2: Runtime (lightweight JRE)
# Use the glibc (non-alpine) Temurin image: the AWS SDK v2
# (S3) relies on glibc-native bindings which fail on musl.
# ============================================================
FROM eclipse-temurin:21-jre

LABEL org.opencontainers.image.title="AddexStores Backend" \
      org.opencontainers.image.description="E-commerce platform backend API" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="AddexStores" \
      org.opencontainers.image.source="https://github.com/ibrahimabdullapm/addexstore" \
      org.opencontainers.image.licenses="MIT"

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup -d /app -s /sbin/nologin appuser

WORKDIR /app

# Copy JAR from build stage
COPY --from=build --chown=appuser:appgroup /build/target/backend.jar /app/backend.jar

# Create uploads directory with correct permissions
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Railway injects PORT; default to 8080 for local/Docker
ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+AlwaysActAsServerClassMachine \
    -Djava.security.egd=file:/dev/./urandom"

# Graceful shutdown
STOPSIGNAL SIGTERM

# Health check via Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/actuator/health || exit 1

EXPOSE ${PORT}

ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+AlwaysActAsServerClassMachine -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar /app/backend.jar"]
