"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getPolicies, getMe } from "@/lib/api"
import { ArrowLeft, Download, Package, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import QRCode from "qrcode"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface Policy {
  id: number
  yellow_card_number: string
}

export default function ExportQRCodesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getMe().catch(() => router.push("/login"))
    getPolicies().then((data) => {
      setPolicies(data)
      setLoading(false)
    })
  }, [router])

  const exportAllQRCodes = async (transparent: boolean) => {
    setExporting(true)
    setProgress(0)
    setCompleted(false)

    const zip = new JSZip()
    const baseUrl = "https://yc.comesa.cc/YellowCard-policy-verify.html"
    const folder = zip.folder(transparent ? "qr-codes-transparent" : "qr-codes-white")

    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i]
      const fullUrl = `${baseUrl}?yellow_card_number=${policy.yellow_card_number}`

      const canvas = document.createElement("canvas")
      canvas.width = 1000
      canvas.height = 1000
      const ctx = canvas.getContext("2d")

      if (ctx) {
        if (!transparent) {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, 1000, 1000)
        }

        const qrCanvas = document.createElement("canvas")
        await QRCode.toCanvas(qrCanvas, fullUrl, {
          width: 1000,
          margin: 2,
          color: {
            dark: "#000000",
            light: transparent ? "#00000000" : "#ffffff",
          },
        })
        ctx.drawImage(qrCanvas, 0, 0)

        const dataUrl = canvas.toDataURL("image/png").split(",")[1]
        const suffix = transparent ? "-transparent" : ""
        folder?.file(`${policy.yellow_card_number}${suffix}.png`, dataUrl, { base64: true })
      }

      setProgress(Math.round(((i + 1) / policies.length) * 100))
    }

    const content = await zip.generateAsync({ type: "blob" })
    const filename = transparent ? "qr-codes-transparent.zip" : "qr-codes-white.zip"
    saveAs(content, filename)

    setExporting(false)
    setCompleted(true)
  }

  return (
    <DashboardLayout title="Export QR Codes">
      <div className="space-y-6 max-w-2xl">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
          <Link href="/policies">
            <ArrowLeft className="h-4 w-4" /> Back to Policies
          </Link>
        </Button>

        <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Bulk Export QR Codes</CardTitle>
                <CardDescription>Download all QR codes as a ZIP file</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="p-4 rounded-xl bg-muted/50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Policies</span>
                <span className="text-2xl font-bold text-foreground">{loading ? "..." : policies.length}</span>
              </div>
            </div>

            {/* Progress */}
            {exporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Generating QR codes...</span>
                  <span className="font-medium text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Completed */}
            {completed && !exporting && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400">Export completed! Check your downloads folder.</span>
              </div>
            )}

            {/* Export Buttons */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Button
                onClick={() => exportAllQRCodes(false)}
                disabled={loading || exporting || policies.length === 0}
                className="h-auto py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl"
              >
                <div className="flex flex-col items-center gap-2">
                  {exporting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Download className="h-6 w-6" />
                  )}
                  <span className="font-medium">White Background</span>
                  <span className="text-xs opacity-80">Best for printing</span>
                </div>
              </Button>
              <Button
                onClick={() => exportAllQRCodes(true)}
                disabled={loading || exporting || policies.length === 0}
                variant="outline"
                className="h-auto py-4 rounded-xl border-border dark:border-slate-700"
              >
                <div className="flex flex-col items-center gap-2">
                  {exporting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Download className="h-6 w-6" />
                  )}
                  <span className="font-medium">Transparent</span>
                  <span className="text-xs text-muted-foreground">Best for overlays</span>
                </div>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Each QR code will be named after its Yellow Card number (e.g., ZW1234567.png)
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
