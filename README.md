# claude-usage-api

Minimal dashboard showing Claude Pro/Max usage against rate limits. Makes a tiny API call and reads the `anthropic-ratelimit-unified-*` response headers to surface 5h and 7d utilization.

<p align="center">
  <img src="screenshots/homepage_light.png" alt="Homepage light screenshot"  width="360" height="270"/>
  <img src="screenshots/homepage_dark.png" alt="Homepage dark screenshot"  width="360" height="270"/>
</p>

## API

```
GET /api/usage
```

```json
{
  "s": 69,
  "sr": 6769,
  "w": 9,
  "wr": 440569,
  "st": "allowed",
  "ok": true,
  "at": 1778783831188
}
```

| field | meaning                     |
| ----- | --------------------------- |
| `s`   | 5h utilization %            |
| `sr`  | seconds until 5h reset      |
| `w`   | 7d utilization %            |
| `wr`  | seconds until 7d reset      |
| `st`  | `allowed` or `rate_limited` |
| `ok`  | HTTP success                |
| `at`  | timestamp of last update    |

## Docker

Docker image available at `ghcr.io/zareix/claude-usage-api`.

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
# .env
CLAUDE_OAUTH_TOKEN=your_token_here
```

```bash
bun install
bun run dev
```
