-- Seed: Default tenant
-- Idempotent insert for a default tenant 'Acme Corp' with slug 'acme'

SET search_path TO app, public;

INSERT INTO tenants (name, slug)
VALUES ('Acme Corp', 'acme')
ON CONFLICT (name) DO NOTHING;
