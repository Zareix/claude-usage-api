export type ClaudeUsage = {
  usagePercent5h: number; // 5h utilization %
  resetIn5h: number;     // seconds until 5h reset
  usagePercent7d: number; // 7d utilization %
  resetIn7d: number;     // seconds until 7d reset
  status: string;        // unified status
  ok: boolean;
};

export const getClaudeUsage = async (): Promise<ClaudeUsage> => {
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
    usagePercent5h:
      Number.parseFloat(
        h.get("anthropic-ratelimit-unified-5h-utilization") ?? "0",
      ) * 100,
    resetIn5h: Math.max(
      0,
      Math.round(
        Number.parseFloat(
          h.get("anthropic-ratelimit-unified-5h-reset") ?? "0",
        ) -
          Date.now() / 1000,
      ),
    ),
    usagePercent7d:
      Number.parseFloat(
        h.get("anthropic-ratelimit-unified-7d-utilization") ?? "0",
      ) * 100,
    resetIn7d: Math.max(
      0,
      Math.round(
        Number.parseFloat(
          h.get("anthropic-ratelimit-unified-7d-reset") ?? "0",
        ) -
          Date.now() / 1000,
      ),
    ),
    status:
      h.get("anthropic-ratelimit-unified-status") ??
      (res.ok ? "allowed" : `error_${res.status}`),
    ok: res.ok,
  };
};
