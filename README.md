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

git pull
bun install

sudo systemctl restart kindle-kitchen-dashboard.service
```
