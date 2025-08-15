import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { url, maxRedirects = 10 } = await req.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    let currentUrl = url
    const redirectChain: string[] = [currentUrl]
    let redirectCount = 0

    while (redirectCount < maxRedirects) {
      try {
        const response = await fetch(currentUrl, {
          method: "HEAD",
          redirect: "manual",
        })

        // Check if it's a redirect status
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get("location")
          if (location) {
            // Handle relative URLs by resolving them against the current URL
            currentUrl = new URL(location, currentUrl).href
            redirectChain.push(currentUrl)
            redirectCount++
          } else {
            // No location header, break the loop
            break
          }
        } else {
          // Not a redirect, we've reached the final destination
          break
        }
      } catch (error) {
        console.error(`Error fetching ${currentUrl}:`, error)
        break
      }
    }

    return NextResponse.json({
      redirectChain,
      finalUrl: redirectChain[redirectChain.length - 1],
      redirectCount: redirectChain.length - 1,
    })
  } catch (error) {
    console.error("Redirect check error:", error)
    return NextResponse.json({ error: "Failed to check redirects" }, { status: 500 })
  }
}
