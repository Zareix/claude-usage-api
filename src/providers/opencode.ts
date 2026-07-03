import type { Usage } from ".."

const parseResetIn = (text: string): number => {
  const days = Number.parseInt(text.match(/(\d+)\s*day/)?.[1] ?? "0", 10)
  const hours = Number.parseInt(text.match(/(\d+)\s*hour/)?.[1] ?? "0", 10)
  const minutes = Number.parseInt(text.match(/(\d+)\s*minute/)?.[1] ?? "0", 10)
  return days * 86400 + hours * 3600 + minutes * 60
}

export const getOpenCodeUsage = async (): Promise<Usage> => {
  const page = await fetch(`https://opencode.ai/workspace/${process.env.OPENCODE_WORKSPACE}/go`, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
      Cookie: `auth=${process.env.OPENCODE_AUTH_COOKIE}`,
    },
  })

  const usageValues: string[] = []
  let usageBuffer = ""

  const resetsInValues: string[] = []
  let resetsInBuffer = ""

  const rewriter = new HTMLRewriter()
    .on("[data-slot='usage-value']", {
      element(el) {
        usageBuffer = ""
        el.onEndTag(() => {
          usageValues.push(usageBuffer.trim())
        })
      },
      text(chunk) {
        usageBuffer += chunk.text
      },
    })
    .on("[data-slot='reset-time']", {
      element(el) {
        resetsInBuffer = ""
        el.onEndTag(() => {
          resetsInValues.push(resetsInBuffer.trim())
        })
      },
      text(chunk) {
        resetsInBuffer += chunk.text
      },
    })

  await rewriter.transform(page).text()

  const [usagePercent5h, usagePercent7d] = usageValues.map((v) => Number.parseFloat(v))
  const [resetIn5h, resetIn7d] = resetsInValues.map(parseResetIn)

  return {
    ok: true,
    usagePercent5h: usagePercent5h ?? 0,
    resetIn5h: resetIn5h ?? 0,
    usagePercent7d: usagePercent7d ?? 0,
    resetIn7d: resetIn7d ?? 0,
    status: (usagePercent5h ?? 0) < 100 && (usagePercent7d ?? 0) < 100 ? "allowed" : "rate_limited",
  }
}
