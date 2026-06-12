import { getClaudeUsage, type ClaudeUsage } from "./claude"
import index from "./index.html"

const CACHE_TTL = 60_000
let cache: { data: ClaudeUsage; at: number } | null = null

const getCachedUsage = async (): Promise<ClaudeUsage & { fetchedAt: number }> => {
  if (cache && Date.now() - cache.at < CACHE_TTL) return { ...cache.data, fetchedAt: cache.at }
  const data = await getClaudeUsage()
  cache = { data, at: Date.now() }
  return { ...data, fetchedAt: cache.at }
}

const server = Bun.serve({
  routes: {
    "/": index,
    "/api/usage": {
      GET: async () => Response.json(await getCachedUsage()),
    },
  },
})

console.log(`Server running at ${server.url.toString()}`)
