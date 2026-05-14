import { getClaudeUsage, type ClaudeUsage } from "./claude";
import index from "./index.html";

const CACHE_TTL = 60_000;
let cache: { data: ClaudeUsage; at: number } | null = null;

const getCachedUsage = async (): Promise<ClaudeUsage & { at: number }> => {
  if (cache && Date.now() - cache.at < CACHE_TTL) return { ...cache.data, at: cache.at };
  const data = await getClaudeUsage();
  cache = { data, at: Date.now() };
  return { ...data, at: cache.at };
};

const server = Bun.serve({
  routes: {
    "/": index,
    "/api/usage": {
      GET: async () =>
        new Response(JSON.stringify(await getCachedUsage()), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    },
  },
});

console.log(`Server running at ${server.url}`);
