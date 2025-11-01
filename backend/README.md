# Backend Workspace

This folder will host backend services for the Device Remote Management platform.

Components:
- DatabaseContainer: PostgreSQL container with initial schema and init scripts.

Next steps:
- Implement backend API services that connect to the DatabaseContainer using environment variables (do not hardcode credentials).
- Ensure services use the 'app' schema and the tables created by the initial migration.
- Read the connection string from DATABASE_URL (format: postgresql://USER:PASSWORD@HOST:PORT/DBNAME).
- Prefer using the application role (APP_DB_USER) with search_path set to "app, public".
