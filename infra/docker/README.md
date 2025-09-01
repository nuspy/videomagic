# Docker Compose (web + api + db + minio [+ mailpit in dev])

This folder contains two Compose stacks:

- docker-compose.dev.yml (development): web (Nginx), api (Express), db (MariaDB), minio (S3), mailpit (SMTP test).
- docker-compose.prod.yml (production): web (Nginx), api (Express), db (MariaDB), minio (S3).

## Quick Start

From the repository root (or `infra/docker`), run:

Dev:
- Start: `docker compose -f infra/docker/docker-compose.dev.yml up -d --build`
- Stop:  `docker compose -f infra/docker/docker-compose.dev.yml down`
- Stop + remove volumes (db/minio data): `docker compose -f infra/docker/docker-compose.dev.yml down -v`

Prod:
- Start: `docker compose -f infra/docker/docker-compose.prod.yml up -d --build`
- Stop:  `docker compose -f infra/docker/docker-compose.prod.yml down`

Services (dev):
- Web: http://localhost:8080
- API: http://localhost:4000 (health: /healthz)
- MariaDB: localhost:3306 (root/root, db: app_db)
- MinIO: S3 http://localhost:9000, Console http://localhost:9001 (minio/minio123)
- Mailpit UI: http://localhost:8025, SMTP: 127.0.0.1:1025

## Environment Overrides

- You can pass a custom env file: `docker compose --env-file path/to/.env -f infra/docker/docker-compose.prod.yml up -d`
- Compose variables like `${VAR}` in the prod file can be overridden via environment or `--env-file`.
- API service environment covers DB, CORS, S3/MinIO, OAuth, JWT, SMTP, and Payments config.

## Changing the Domain (prod)

- Nginx: edit `infra/docker/nginx.conf` and set `server_name` to your domain (e.g., `example.com`).
- API CORS: update `ALLOWED_ORIGINS` in `docker-compose.prod.yml` to your web origin (e.g., `https://example.com`).
- OAuth redirect URI: set `OAUTH_REDIRECT_URI` to your API host (e.g., `https://api.example.com/auth/google/callback`).
- Optional: map ports to 80/443 behind a reverse proxy or load balancer; add TLS termination there.

## CORS Notes

- The API restricts CORS via `ALLOWED_ORIGINS`.
  - Dev defaults to `http://localhost:8080` (Nginx for web).
  - Prod example uses `https://example.com`. Adjust to your real web origin(s).
- If the API is on a different subdomain (e.g. `api.example.com`) and web on `example.com`,
  set `ALLOWED_ORIGINS=https://example.com` (and any additional origins you need, comma-separated).

## Healthchecks

- API has a `/healthz` endpoint probed by Compose healthchecks.
- `depends_on` waits for API to become healthy before starting the web container.

## Data Persistence

- MariaDB data: persisted in the `db_data` volume.
- MinIO objects: persisted in the `minio_data` volume.

## Notes

- Bucket creation is not automated; create the `uploads` bucket in MinIO once (via Console or `mc`).
- In production, change all placeholder secrets and consider restricting exposed ports (db/console) via firewall.
