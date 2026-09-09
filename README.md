# kitchen-dashboard

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run
```

## Pi-Related

After updating the app, we need to manually pull, install, and restart the service on Pi using

```
cd /opt/kindle-kitchen-dashboard

git pull --ff-only
bun install --frozen-lockfile
bun run build

sudo systemctl restart kindle-kitchen-dashboard.service
```

The service listens on port `8888` by default and serves both the dashboard and API. The SQLite database is stored in `app/db/data/sqlite.db`; migrations run automatically when the service starts. For LAN access, the systemd service should run as a user with write access to the repository so SQLite can update that file.
