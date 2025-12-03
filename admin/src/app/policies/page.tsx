"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getPolicies, deletePolicy, getMe } from "@/lib/api"
import { Pencil, Trash2, Plus, Search, FileStack, Eye, QrCode, Download } from "lucide-react"
import QRCode from "qrcode"

interface Policy {
  id: number
  yellow_card_number: string
  customer_name: string
  vehicle_reg_number: string
  valid_from: string
  valid_upto: string
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-32 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  )
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [filtered, setFiltered] = useState<Policy[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [downloadingQR, setDownloadingQR] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    getMe().catch(() => router.push("/login"))
    loadPolicies()
  }, [router])

  useEffect(() => {
    if (search) {
      setFiltered(policies.filter(p => 
        p.yellow_card_number?.toLowerCase().includes(search.toLowerCase()) ||
        p.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.vehicle_reg_number?.toLowerCase().includes(search.toLowerCase())
      ))
    } else {
      setFiltered(policies)
    }
  }, [search, policies])

  const loadPolicies = async () => {
    const data = await getPolicies()
    setPolicies(data)
    setFiltered(data)
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this policy?")) return
    await deletePolicy(id)
    loadPolicies()
  }

  const downloadQR = async (yellowCardNumber: string, id: number) => {
    setDownloadingQR(id)
    const baseUrl = "https://yc.comesa.cc/YellowCard-policy-verify.html"
    const fullUrl = `${baseUrl}?yellow_card_number=${yellowCardNumber}`
    
    // Generate QR with transparent background at 1000x1000
    const qrCanvas = document.createElement("canvas")
    await QRCode.toCanvas(qrCanvas, fullUrl, { 
      width: 1000, 
      margin: 2,
      color: { dark: "#000000", light: "#00000000" }
    })

    const link = document.createElement("a")
    link.download = `${yellowCardNumber}.png`
    link.href = qrCanvas.toDataURL("image/png")
    link.click()
    
    setDownloadingQR(null)
  }

  return (
    <DashboardLayout title="Policies">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700/50 rounded-xl"
            />
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl">
            <Link href="/policies/new">
              <Plus className="mr-2 h-4 w-4" /> Add Policy
            </Link>
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-border dark:border-slate-800/50 bg-muted/30 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileStack className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">All Policies</CardTitle>
              <Badge variant="secondary" className="ml-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">{filtered.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <TableSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border dark:border-slate-800/50 hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground">Yellow Card #</TableHead>
                    <TableHead className="font-semibold text-foreground">Customer</TableHead>
                    <TableHead className="font-semibold text-foreground">Vehicle Reg</TableHead>
                    <TableHead className="font-semibold text-foreground">Valid From</TableHead>
                    <TableHead className="font-semibold text-foreground">Valid Upto</TableHead>
                    <TableHead className="w-44 font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No policies found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((policy) => (
                      <TableRow key={policy.id} className="border-border dark:border-slate-800/50 hover:bg-muted/50 dark:hover:bg-slate-800/50">
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={policy.yellow_card_number?.startsWith('ZM') 
                              ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                              : policy.yellow_card_number?.startsWith('ZW')
                              ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                              : 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                            }
                          >
                            {policy.yellow_card_number}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{policy.customer_name || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{policy.vehicle_reg_number || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{policy.valid_from || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{policy.valid_upto || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link 
                              href={`/policies/${policy.id}/view`}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button 
                              onClick={() => downloadQR(policy.yellow_card_number, policy.id)}
                              disabled={downloadingQR === policy.id}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors disabled:opacity-50"
                              title="Download QR"
                            >
                              {downloadingQR === policy.id ? (
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <QrCode className="h-4 w-4" />
                              )}
                            </button>
                            <Link 
                              href={`/policies/${policy.id}`}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(policy.id)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
