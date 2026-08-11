import type { Usage } from ".."

type GoUsageResponse = {
  useBalance: boolean
  rollingUsage: {
    status: "ok" | "rate-limited"
    resetInSec: number
    usagePercent: number
  }
  weeklyUsage: {
    status: "ok" | "rate-limited"
    resetInSec: number
    usagePercent: number
  }
  monthlyUsage: {
    status: "ok" | "rate-limited"
    resetInSec: number
    usagePercent: number
  }
}

// Official OpenCode Go usage endpoint (anomalyco/opencode#16513).
// Returns rolling (5h), weekly (7d) and monthly usage in dollars.
export const getOpenCodeUsage = async (): Promise<Usage> => {
  const apiKey = process.env.OPENCODE_API_KEY
  if (!apiKey) throw new Error("OPENCODE_API_KEY not set")

  const res = await fetch("https://opencode.ai/zen/go/v1/usage", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!res.ok) throw new Error(`usage API returned ${res.status}`)

  const data = (await res.json()) as GoUsageResponse
  const rateLimited =
    data.rollingUsage.status === "rate-limited" || data.weeklyUsage.status === "rate-limited"

  return {
    ok: true,
    usagePercent5h: data.rollingUsage.usagePercent,
    resetIn5h: data.rollingUsage.resetInSec,
    usagePercent7d: data.weeklyUsage.usagePercent,
    resetIn7d: data.weeklyUsage.resetInSec,
    status: rateLimited ? "rate_limited" : "allowed",
    useBalance: data.useBalance,
    monthlyUsagePercent: data.monthlyUsage.usagePercent,
    resetInMonthly: data.monthlyUsage.resetInSec,
  }
}
