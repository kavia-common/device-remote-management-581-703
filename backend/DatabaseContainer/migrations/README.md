This folder is reserved for future SQL migrations (applied after initial bootstrap).

Recommended approaches:
- Use a migrations tool like Flyway, Sqitch, or Prisma Migrate.
- Maintain files with an incremental naming convention, e.g.:
  002_add_indexes.sql
  003_add_job_retry_fields.sql

Note: The initial bootstrap schema is created by init/02_001_initial_schema.sql on first run only.
