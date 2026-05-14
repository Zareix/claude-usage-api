import index from "./index.html";

type ClaudeUsage = {
  s: number; // 5h utilization %
  sr: number; // seconds until 5h reset
  w: number; // 7d utilization %
  wr: number; // seconds until 7d reset
  st: string; // unified status
  ok: boolean;
};

const getClaudeUsage = async (): Promise<ClaudeUsage> => {
  const token = process.env.CLAUDE_OAUTH_TOKEN;
  if (!token) throw new Error("CLAUDE_OAUTH_TOKEN not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1,
      messages: [{ role: "user", content: "1" }],
    }),
  });

  const h = res.headers;

  return {
    s:
      Number.parseFloat(
        h.get("anthropic-ratelimit-unified-5h-utilization") ?? "0",
      ) * 100,
    sr: Math.max(0, Math.round(Number.parseFloat(h.get("anthropic-ratelimit-unified-5h-reset") ?? "0") - Date.now() / 1000)),
    w:
      Number.parseFloat(
        h.get("anthropic-ratelimit-unified-7d-utilization") ?? "0",
      ) * 100,
    wr: Math.max(0, Math.round(Number.parseFloat(h.get("anthropic-ratelimit-unified-7d-reset") ?? "0") - Date.now() / 1000)),
    st:
      h.get("anthropic-ratelimit-unified-status") ??
      (res.ok ? "allowed" : `error_${res.status}`),
    ok: res.ok,
  };
};

const server = Bun.serve({
  routes: {
    "/": index,
    "/api/usage": {
      GET: async () =>
        new Response(JSON.stringify(await getClaudeUsage()), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    },
  },
});

console.log(`Server running at ${server.url}`);
