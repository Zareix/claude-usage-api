# claude-usage-api

Minimal dashboard showing Claude Pro/Max usage against rate limits. Makes a tiny API call and reads the `anthropic-ratelimit-unified-*` response headers to surface 5h and 7d utilization.

<img src="screenshot.png" style="max-width: 380">

## API

```
GET /api/usage
```

```json
{ "s": 62, "sr": 14400, "w": 4, "wr": 432000, "st": "allowed", "ok": true }
```

| field | meaning |
|-------|---------|
| `s`   | 5h utilization % |
| `sr`  | seconds until 5h reset |
| `w`   | 7d utilization % |
| `wr`  | seconds until 7d reset |
| `st`  | `allowed` or `rate_limited` |
| `ok`  | HTTP success |

## Docker

Image available at `ghcr.io/zareix/claude-usage-api`.

```bash
# .env
CLAUDE_OAUTH_TOKEN=your_token_here
```

```bash
docker compose up
```

Or run directly:

```bash
docker run -e CLAUDE_OAUTH_TOKEN=your_token -p 3000:3000 ghcr.io/zareix/claude-usage-api
```

Runs on port `3000`. UI at `http://localhost:3000`.

## Dev

```bash
bun install
CLAUDE_OAUTH_TOKEN=your_token bun --hot src/index.ts
```
