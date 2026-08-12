import type { Usage } from ".."

type GoUsageResponse = {
  usage: {
    rolling: { status: "ok" | "rate-limited"; percent: number; resetsAt: string }
    weekly: { status: "ok" | "rate-limited"; percent: number; resetsAt: string }
    monthly: { status: "ok" | "rate-limited"; percent: number; resetsAt: string }
  }
}

const secsUntil = (iso: string): number =>
  Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 1000))

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
    data.usage.rolling.status === "rate-limited" || data.usage.weekly.status === "rate-limited"

  return {
    ok: true,
    usagePercent5h: data.usage.rolling.percent,
    resetIn5h: secsUntil(data.usage.rolling.resetsAt),
    usagePercent7d: data.usage.weekly.percent,
    resetIn7d: secsUntil(data.usage.weekly.resetsAt),
    status: rateLimited ? "rate_limited" : "allowed",
    monthlyUsagePercent: data.usage.monthly.percent,
    resetInMonthly: secsUntil(data.usage.monthly.resetsAt),
  }
}
