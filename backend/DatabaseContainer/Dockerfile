# Lightweight Postgres image with init scripts for first-time setup
FROM postgres:16-alpine

# Ensure init scripts directory exists and copy our SQL init/migrations
# Note: All scripts here run only on the first initialization of the database volume
COPY init /docker-entrypoint-initdb.d

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD pg_isready -U "$POSTGRES_USER" || exit 1
