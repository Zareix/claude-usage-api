import { getClaudeUsage } from "./providers/claude"
import index from "./index.html"
import { getOpenCodeUsage } from "./providers/opencode"

if (Bun.argv[2] === "health") {
  const res = await fetch("http://localhost:3000/api/health").catch(() => null)
  process.exit(res?.ok ? 0 : 1)
}

const CACHE_TTL = 60_000
const PROVIDERS = ["claude", "opencode"]
type Provider = (typeof PROVIDERS)[number]
export type Usage = {
  usagePercent5h: number // 5h utilization %
  resetIn5h: number // seconds until 5h reset
  usagePercent7d: number // 7d utilization %
  resetIn7d: number // seconds until 7d reset
  status: string // unified status
  ok: boolean
}
const cache = new Map<Provider, { data: Usage; at: number }>()

const getCachedUsage = async (provider: Provider): Promise<Usage & { fetchedAt: number }> => {
  const cached = cache.get(provider)
  if (cached && Date.now() - cached.at < CACHE_TTL) return { ...cached.data, fetchedAt: cached.at }
  const data = provider === "claude" ? await getClaudeUsage() : await getOpenCodeUsage()
  const entry = { data, at: Date.now() }
  cache.set(provider, entry)
  return { ...data, fetchedAt: entry.at }
}

const server = Bun.serve({
  routes: {
    "/": index,
    "/api/health": { GET: () => new Response("ok") },
    "/api/usage": {
      GET: async ({ url }) => {
        const provider = new URL(url).searchParams.get("provider") as Provider | undefined
        return Response.json(await getCachedUsage(provider ?? "claude"))
      },
    },
  },
})

console.log(`Server running at ${server.url.toString()}`)
