import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "pURLs - Parameter Editor for URLs",
  description:
    "Parameter editor for URLs. When adding URL parameters to existing ones this will help keep the separators clear and ensure you have a functional URL.",
  keywords: ["url", "parameters", "utm", "tracking", "query-string", "url-builder", "marketing", "analytics"],
  authors: [{ name: "pURLs" }],
  creator: "pURLs",
  publisher: "pURLs",
  openGraph: {
    title: "pURLs - Parameter Editor for URLs",
    description:
      "Parameter editor for URLs. When adding URL parameters to existing ones this will help keep the separators clear and ensure you have a functional URL.",
    url: "https://purls.dev",
    siteName: "pURLs",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "pURLs - Parameter Editor for URLs",
    description:
      "Parameter editor for URLs. When adding URL parameters to existing ones this will help keep the separators clear and ensure you have a functional URL.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
