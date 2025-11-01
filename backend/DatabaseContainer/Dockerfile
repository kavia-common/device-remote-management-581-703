# Lightweight Postgres image with init scripts for first-time setup
FROM postgres:16-alpine

# Copy init scripts. Files in this directory run on first DB initialization only.
COPY init /docker-entrypoint-initdb.d

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD pg_isready -U "$POSTGRES_USER" || exit 1
