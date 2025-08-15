"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Copy, Link, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface QueryParam {
  id: string
  key: string
  value: string
}

export default function URLParamEditor() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [params, setParams] = useState<QueryParam[]>([])
  const [copySuccess, setCopySuccess] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [redirectResults, setRedirectResults] = useState<{
    finalUrl: string
    redirectChain: string[]
    preservedParams: string[]
    lostParams: string[]
    newParams: string[]
    redirectCount: number
  } | null>(null)
  const [showRedirectResults, setShowRedirectResults] = useState(false)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const parseUrl = useCallback((url: string) => {
    if (!url.trim()) {
      setBaseUrl("")
      setParams([])
      return
    }

    try {
      // Handle malformed URLs where fragment comes before query string
      let cleanUrl = url
      const fragmentBeforeQuery = url.match(/^([^#]*)(#[^?]*)\?(.*)$/)
      if (fragmentBeforeQuery) {
        // Reorder: base + query + fragment
        cleanUrl = `${fragmentBeforeQuery[1]}?${fragmentBeforeQuery[3]}${fragmentBeforeQuery[2]}`
      }

      const urlObj = new URL(cleanUrl)
      const base = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
      setBaseUrl(base)

      const paramArray: QueryParam[] = []
      urlObj.searchParams.forEach((value, key) => {
        paramArray.push({
          id: generateId(),
          key,
          value,
        })
      })

      // Add fragment as a special parameter if it exists
      if (urlObj.hash) {
        paramArray.push({
          id: generateId(),
          key: "#fragment",
          value: urlObj.hash.substring(1), // Remove the # symbol
        })
      }

      setParams(paramArray)
    } catch (error) {
      // If URL is invalid, try to extract base, params, and fragment manually
      let workingUrl = url
      let fragment = ""

      // Extract fragment first
      const fragmentMatch = workingUrl.match(/^([^#]*)(#.*)$/)
      if (fragmentMatch) {
        workingUrl = fragmentMatch[1]
        fragment = fragmentMatch[2].substring(1) // Remove #
      }

      // Handle case where fragment appears before query string
      const fragmentBeforeQueryMatch = url.match(/^([^#]*)(#[^?]*)\?(.*)$/)
      if (fragmentBeforeQueryMatch) {
        workingUrl = `${fragmentBeforeQueryMatch[1]}?${fragmentBeforeQueryMatch[3]}`
        fragment = fragmentBeforeQueryMatch[2].substring(1) // Remove #
      }

      const parts = workingUrl.split("?")
      if (parts.length >= 2) {
        setBaseUrl(parts[0])
        const queryString = parts.slice(1).join("?")
        const paramArray: QueryParam[] = []

        queryString.split("&").forEach((param) => {
          const [key, ...valueParts] = param.split("=")
          if (key) {
            paramArray.push({
              id: generateId(),
              key: decodeURIComponent(key),
              value: decodeURIComponent(valueParts.join("=") || ""),
            })
          }
        })

        // Add fragment if it exists
        if (fragment) {
          paramArray.push({
            id: generateId(),
            key: "#fragment",
            value: fragment,
          })
        }

        setParams(paramArray)
      } else {
        setBaseUrl(parts[0])
        const paramArray: QueryParam[] = []

        // Add fragment if it exists
        if (fragment) {
          paramArray.push({
            id: generateId(),
            key: "#fragment",
            value: fragment,
          })
        }

        setParams(paramArray)
      }
    }
  }, [])

  const updateParam = (id: string, field: "key" | "value", newValue: string) => {
    setParams((prev) => prev.map((param) => (param.id === id ? { ...param, [field]: newValue } : param)))
  }

  const removeParam = (id: string) => {
    setParams((prev) => prev.filter((param) => param.id !== id))
  }

  const addParam = () => {
    const newParam = {
      id: generateId(),
      key: "",
      value: "",
    }

    // Insert before any fragments
    const fragmentIndex = params.findIndex((p) => p.key === "#fragment")
    if (fragmentIndex !== -1) {
      setParams((prev) => [...prev.slice(0, fragmentIndex), newParam, ...prev.slice(fragmentIndex)])
    } else {
      setParams((prev) => [...prev, newParam])
    }
  }

  const addUtmFields = () => {
    const utmFields = [
      { key: "utm_source", value: "" },
      { key: "utm_medium", value: "" },
      { key: "utm_campaign", value: "" },
      { key: "utm_term", value: "" },
      { key: "utm_content", value: "" },
    ]

    const existingKeys = new Set(params.map((p) => p.key))
    const newParams = utmFields
      .filter((field) => !existingKeys.has(field.key))
      .map((field) => ({
        id: generateId(),
        ...field,
      }))

    // Insert before any fragments
    const fragmentIndex = params.findIndex((p) => p.key === "#fragment")
    if (fragmentIndex !== -1) {
      setParams((prev) => [...prev.slice(0, fragmentIndex), ...newParams, ...prev.slice(fragmentIndex)])
    } else {
      setParams((prev) => [...prev, ...newParams])
    }
  }

  const buildUrl = () => {
    if (!baseUrl) return ""

    const validParams = params.filter((param) => param.key.trim() && param.key !== "#fragment")
    const fragmentParam = params.find((param) => param.key === "#fragment")

    let finalUrl = baseUrl

    // Add query parameters
    if (validParams.length > 0) {
      const queryString = validParams
        .map((param) => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
        .join("&")
      finalUrl += `?${queryString}`
    }

    // Add fragment at the end
    if (fragmentParam && fragmentParam.value.trim()) {
      finalUrl += `#${fragmentParam.value}`
    }

    return finalUrl
  }

  const copyToClipboard = async () => {
    const finalUrl = buildUrl()
    try {
      await navigator.clipboard.writeText(finalUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const checkRedirects = async () => {
    const testUrl = buildUrl()
    if (!testUrl) return

    setIsChecking(true)
    setRedirectResults(null)
    setShowRedirectResults(false)

    try {
      // Call our API route to check redirects
      const response = await fetch("/api/redirect-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: testUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to check redirects")
      }

      const { redirectChain, finalUrl, redirectCount } = await response.json()

      // Parse original parameters
      const originalParams = new URLSearchParams(new URL(testUrl).search)
      const originalParamMap = new Map()
      originalParams.forEach((value, key) => {
        originalParamMap.set(key, value)
      })

      // Parse final URL parameters
      const finalParams = new URLSearchParams(new URL(finalUrl).search)
      const finalParamMap = new Map()
      finalParams.forEach((value, key) => {
        finalParamMap.set(key, value)
      })

      // Compare parameters
      const preservedParams: string[] = []
      const lostParams: string[] = []
      const newParams: string[] = []

      // Check for preserved and lost params
      originalParamMap.forEach((value, key) => {
        if (finalParamMap.has(key)) {
          const finalValue = finalParamMap.get(key)
          if (value === finalValue) {
            preservedParams.push(`${key}=${value}`)
          } else {
            preservedParams.push(`${key}=${finalValue} (changed from ${value})`)
          }
        } else {
          lostParams.push(`${key}=${value}`)
        }
      })

      // Check for new params
      finalParamMap.forEach((value, key) => {
        if (!originalParamMap.has(key)) {
          newParams.push(`${key}=${value}`)
        }
      })

      setRedirectResults({
        finalUrl,
        redirectChain,
        preservedParams,
        lostParams,
        newParams,
        redirectCount,
      })
      setShowRedirectResults(true)
    } catch (error) {
      console.error("Error checking redirects:", error)
      // Show error state
      setRedirectResults({
        finalUrl: testUrl,
        redirectChain: [testUrl],
        preservedParams: [],
        lostParams: [],
        newParams: [],
        redirectCount: 0,
      })
      setShowRedirectResults(true)
    } finally {
      setIsChecking(false)
    }
  }

  const finalUrl = buildUrl()

  // Sort params so fragments are always last
  const sortedParams = [...params].sort((a, b) => {
    if (a.key === "#fragment" && b.key !== "#fragment") return 1
    if (a.key !== "#fragment" && b.key === "#fragment") return -1
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            p<span className="text-blue-600">URL</span>s
          </h1>
          <p className="text-lg text-gray-700 font-medium">Parameter editor for URLs</p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            When adding URL parameters to existing ones, this will help keep the separators clear and ensure you have a
            functional URL. Perfect for managing UTM codes, tracking parameters, and URL fragments.
          </p>
        </div>

        {/* URL Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Original URL
            </CardTitle>
            <CardDescription>Paste your URL here to extract and edit query parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="https://example.com/page?param1=value1&param2=value2"
                value={originalUrl}
                onChange={(e) => {
                  setOriginalUrl(e.target.value)
                  parseUrl(e.target.value)
                }}
                className="text-sm"
              />
              {baseUrl && (
                <div className="text-sm text-gray-600">
                  <strong>Base URL:</strong> {baseUrl}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parameters Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Query Parameters</CardTitle>
            <CardDescription>Edit existing parameters or add new ones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedParams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No parameters found. Add some below or paste a URL with parameters above.
              </div>
            ) : (
              <div className="space-y-3">
                {sortedParams.map((param, index) => {
                  // Calculate the actual query parameter index (excluding fragments)
                  const queryParams = sortedParams.filter((p) => p.key !== "#fragment")
                  const queryParamIndex = queryParams.findIndex((p) => p.id === param.id)

                  return (
                    <div key={param.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline" className="text-xs font-mono">
                        {param.key === "#fragment" ? "#" : queryParamIndex === 0 ? "?" : "&"}
                      </Badge>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {param.key === "#fragment" ? (
                          // Fragment only needs a value input, no key
                          <>
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-700">Fragment</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`value-${param.id}`} className="sr-only">
                                Fragment Value
                              </Label>
                              <Input
                                id={`value-${param.id}`}
                                placeholder="section-name"
                                value={param.value}
                                onChange={(e) => updateParam(param.id, "value", e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </>
                        ) : (
                          // Regular parameters have key and value
                          <>
                            <div>
                              <Label htmlFor={`key-${param.id}`} className="sr-only">
                                Parameter Key
                              </Label>
                              <Input
                                id={`key-${param.id}`}
                                placeholder="Parameter key"
                                value={param.key}
                                onChange={(e) => updateParam(param.id, "key", e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">=</span>
                              <Label htmlFor={`value-${param.id}`} className="sr-only">
                                Parameter Value
                              </Label>
                              <Input
                                id={`value-${param.id}`}
                                placeholder="Parameter value"
                                value={param.value}
                                onChange={(e) => updateParam(param.id, "value", e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeParam(param.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={addParam} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Parameter
              </Button>
              <Button onClick={addUtmFields} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Add UTM Fields
              </Button>
              <Button
                onClick={() => {
                  const hasFragment = sortedParams.some((p) => p.key === "#fragment")
                  if (!hasFragment) {
                    setParams((prev) => [...prev, { id: generateId(), key: "#fragment", value: "" }])
                  }
                }}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
                disabled={sortedParams.some((p) => p.key === "#fragment")}
              >
                <Plus className="h-4 w-4" />
                Add Fragment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Final URL */}
        {finalUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Final URL</CardTitle>
              <CardDescription>Your reconstructed URL with all parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">{finalUrl}</div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={copyToClipboard} className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  {copySuccess ? "Copied!" : "Copy URL"}
                </Button>
                <Button
                  onClick={checkRedirects}
                  variant="outline"
                  disabled={isChecking}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Link className="h-4 w-4" />
                  {isChecking ? "Checking..." : "Check Redirects"}
                </Button>
              </div>
              {copySuccess && (
                <Alert>
                  <AlertDescription>URL copied to clipboard successfully!</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Redirect Results */}
        {showRedirectResults && redirectResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Redirect Analysis
              </CardTitle>
              <CardDescription>
                Analysis of how your parameters behave through redirects
                {redirectResults.redirectCount > 0 && ` (${redirectResults.redirectCount} redirects found)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Redirect Chain */}
              <div>
                <h4 className="font-semibold mb-2">
                  Redirect Chain ({redirectResults.redirectChain.length} steps)
                  {redirectResults.redirectCount === 0 && " - No redirects detected"}
                </h4>
                <div className="space-y-2">
                  {redirectResults.redirectChain.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge
                        variant={
                          index === 0
                            ? "default"
                            : index === redirectResults.redirectChain.length - 1
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {index === 0
                          ? "Start"
                          : index === redirectResults.redirectChain.length - 1
                            ? "Final"
                            : `Step ${index}`}
                      </Badge>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1">{url}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parameter Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Preserved Parameters */}
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    ✅ Preserved ({redirectResults.preservedParams.length})
                  </h4>
                  {redirectResults.preservedParams.map((param, index) => {
                    const isChanged = param.includes("(changed from") || param.includes("(was")
                    return (
                      <div
                        key={index}
                        className={`text-xs px-2 py-1 rounded ${
                          isChanged
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                            : "bg-green-50 text-green-800"
                        }`}
                      >
                        {param}
                      </div>
                    )
                  })}
                </div>

                {/* Lost Parameters */}
                <div>
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    ❌ Lost ({redirectResults.lostParams.length})
                  </h4>
                  {redirectResults.lostParams.length > 0 ? (
                    <div className="space-y-1">
                      {redirectResults.lostParams.map((param, index) => (
                        <div key={index} className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded">
                          {param}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No parameters lost</div>
                  )}
                </div>

                {/* New Parameters */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    ➕ Added ({redirectResults.newParams.length})
                  </h4>
                  {redirectResults.newParams.length > 0 ? (
                    <div className="space-y-1">
                      {redirectResults.newParams.map((param, index) => (
                        <div key={index} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
                          {param}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No parameters added</div>
                  )}
                </div>
              </div>

              {/* Summary Alert */}
              {redirectResults.lostParams.length > 0 && (
                <Alert>
                  <AlertDescription className="text-red-800">
                    ⚠️ Warning: {redirectResults.lostParams.length} parameter(s) were lost during redirects. This could
                    affect your tracking and analytics.
                  </AlertDescription>
                </Alert>
              )}

              {redirectResults.lostParams.length === 0 && redirectResults.preservedParams.length > 0 && (
                <Alert>
                  <AlertDescription className="text-green-800">
                    ✅ Great! All your parameters were preserved through the redirect chain.
                  </AlertDescription>
                </Alert>
              )}

              {redirectResults.redirectCount === 0 && (
                <Alert>
                  <AlertDescription className="text-blue-800">
                    ℹ️ No redirects detected. The URL goes directly to its destination.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* UTM Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              UTM Parameter Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>utm_source:</strong> Identifies the source (e.g., google, newsletter)
              </div>
              <div>
                <strong>utm_medium:</strong> Identifies the medium (e.g., cpc, email, social)
              </div>
              <div>
                <strong>utm_campaign:</strong> Identifies the campaign (e.g., spring_sale)
              </div>
              <div>
                <strong>utm_term:</strong> Identifies paid search keywords
              </div>
              <div>
                <strong>utm_content:</strong> Differentiates similar content or links
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>
            <span className="font-semibold">
              p<span className="text-blue-600">URL</span>s
            </span>{" "}
            - Making URL parameter management simple and reliable
          </p>
        </div>
      </div>
    </div>
  )
}
