"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, QrCode, ImageIcon, Layers } from "lucide-react"

interface QRCodeGeneratorProps {
  yellowCardNumber: string
  verifyUrl?: string
}

export function QRCodeGenerator({ yellowCardNumber, verifyUrl }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  
  const baseUrl = verifyUrl || "https://yc.comesa.cc/YellowCard-policy-verify.html"
  const fullUrl = `${baseUrl}?yellow_card_number=${yellowCardNumber}`

  useEffect(() => {
    if (canvasRef.current && yellowCardNumber) {
      QRCode.toCanvas(canvasRef.current, fullUrl, {
        width: 180,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
    }
  }, [yellowCardNumber, fullUrl])

  const downloadQR = async (transparent: boolean) => {
    const type = transparent ? "transparent" : "white"
    setDownloading(type)
    
    await new Promise(resolve => setTimeout(resolve, 300)) // Brief delay for UX
    
    const size = 1000
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    
    if (!ctx) return

    if (!transparent) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, size, size)
    }

    const qrCanvas = document.createElement("canvas")
    await QRCode.toCanvas(qrCanvas, fullUrl, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: transparent ? "#00000000" : "#ffffff",
      },
    })

    ctx.drawImage(qrCanvas, 0, 0)

    const link = document.createElement("a")
    const suffix = transparent ? "-transparent" : ""
    link.download = `${yellowCardNumber}${suffix}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
    
    setDownloading(null)
  }

  if (!yellowCardNumber) return null

  return (
    <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border dark:border-slate-800/50 bg-muted/30 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-foreground">QR Code</span>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        {/* QR Code Preview */}
        <div className="flex justify-center">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <canvas ref={canvasRef} className="block" />
          </div>
        </div>

        {/* Yellow Card Number Badge */}
        <div className="flex justify-center">
          <span className="px-3 py-1 text-xs font-mono font-medium bg-muted dark:bg-slate-800 text-muted-foreground rounded-full">
            {yellowCardNumber}
          </span>
        </div>

        {/* Download Options */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">Download as PNG</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => downloadQR(false)}
              variant="outline"
              size="sm"
              disabled={downloading !== null}
              className="h-9 rounded-lg border-border dark:border-slate-700 hover:bg-muted dark:hover:bg-slate-800 transition-all"
            >
              {downloading === "white" ? (
                <div className="h-3.5 w-3.5 mr-1.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span className="text-xs">White BG</span>
            </Button>
            <Button
              onClick={() => downloadQR(true)}
              variant="outline"
              size="sm"
              disabled={downloading !== null}
              className="h-9 rounded-lg border-border dark:border-slate-700 hover:bg-muted dark:hover:bg-slate-800 transition-all"
            >
              {downloading === "transparent" ? (
                <div className="h-3.5 w-3.5 mr-1.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Layers className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span className="text-xs">Transparent</span>
            </Button>
          </div>
        </div>

        {/* Verification URL */}
        <div className="pt-2 border-t border-border dark:border-slate-800/50">
          <p className="text-[10px] text-muted-foreground/70 text-center leading-relaxed break-all">
            Scans to verification page
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
