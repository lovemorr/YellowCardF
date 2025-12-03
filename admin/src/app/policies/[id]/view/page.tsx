"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { getPolicy, getMe } from "@/lib/api"
import { ArrowLeft, Pencil, FileText, Car, Calendar, MapPin, User, Building } from "lucide-react"
import Link from "next/link"

interface PolicyData {
  yellow_card_number: string
  policy_number: string
  pic_name: string
  customer_name: string
  issued_on: string
  issued_timestamp: string
  valid_from: string
  valid_upto: string
  vehicle_make: string
  vehicle_reg_number: string
  vehicle_color: string
  vehicle_engine_number: string
  vehicle_chassis_number: string
  no_of_seats: string
  countries_covered: string
  issuing_nb_contact: string
  secretariat_contact: string
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border dark:border-slate-800/50 last:border-0">
      {Icon && (
        <div className="h-8 w-8 rounded-lg bg-muted dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground whitespace-pre-wrap break-words">{value || "-"}</p>
      </div>
    </div>
  )
}

function ViewSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ViewPolicyPage() {
  const [policy, setPolicy] = useState<PolicyData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  useEffect(() => {
    getMe().catch(() => router.push("/login"))
    getPolicy(id).then((data) => {
      setPolicy(data)
      setLoading(false)
    })
  }, [id, router])

  return (
    <DashboardLayout title="View Policy">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
            <Link href="/policies">
              <ArrowLeft className="h-4 w-4" /> Back to Policies
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 rounded-xl">
            <Link href={`/policies/${id}`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Policy
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Policy Details */}
          <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden h-fit">
            <div className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 border-b border-border dark:border-slate-800/50">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-foreground">{policy?.yellow_card_number}</h2>
                  <p className="text-muted-foreground">{policy?.customer_name || "No customer name"}</p>
                </>
              )}
            </div>
            <CardContent className="p-6">
              {loading ? <ViewSkeleton /> : (
                <div className="grid md:grid-cols-2 gap-x-8">
                  <div>
                    <DetailRow icon={FileText} label="Policy Number" value={policy?.policy_number || ""} />
                    <DetailRow icon={User} label="PIC Name" value={policy?.pic_name || ""} />
                    <DetailRow icon={Calendar} label="Issued On" value={policy?.issued_on || ""} />
                    <DetailRow icon={Calendar} label="Valid From" value={policy?.valid_from || ""} />
                    <DetailRow icon={Calendar} label="Valid Upto" value={policy?.valid_upto || ""} />
                    <DetailRow icon={MapPin} label="Countries Covered" value={policy?.countries_covered || ""} />
                  </div>
                  <div>
                    <DetailRow icon={Car} label="Vehicle Make" value={policy?.vehicle_make || ""} />
                    <DetailRow icon={Car} label="Registration" value={policy?.vehicle_reg_number || ""} />
                    <DetailRow icon={Car} label="Color" value={policy?.vehicle_color || ""} />
                    <DetailRow icon={Car} label="Engine Number" value={policy?.vehicle_engine_number || ""} />
                    <DetailRow icon={Car} label="Chassis Number" value={policy?.vehicle_chassis_number || ""} />
                    <DetailRow label="No. of Seats" value={policy?.no_of_seats || ""} />
                    <DetailRow icon={Building} label="Issuing NB Contact" value={policy?.issuing_nb_contact || ""} />
                    <DetailRow icon={Building} label="Secretariat Contact" value={policy?.secretariat_contact || ""} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <div className="h-fit">
            {!loading && policy?.yellow_card_number && (
              <QRCodeGenerator yellowCardNumber={policy.yellow_card_number} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
