"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { getPolicy, updatePolicy, getMe } from "@/lib/api"
import { Pencil, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const fields = [
  { name: "yellow_card_number", label: "Yellow Card Number", required: true },
  { name: "policy_number", label: "Policy Number" },
  { name: "pic_name", label: "PIC Name" },
  { name: "customer_name", label: "Customer Name" },
  { name: "issued_on", label: "Issued On" },
  { name: "issued_timestamp", label: "Issued Timestamp" },
  { name: "valid_from", label: "Valid From" },
  { name: "valid_upto", label: "Valid Upto" },
  { name: "vehicle_make", label: "Vehicle Make" },
  { name: "vehicle_reg_number", label: "Vehicle Reg Number" },
  { name: "vehicle_color", label: "Vehicle Color" },
  { name: "vehicle_engine_number", label: "Engine Number" },
  { name: "vehicle_chassis_number", label: "Chassis Number" },
  { name: "no_of_seats", label: "No. of Seats" },
  { name: "countries_covered", label: "Countries Covered" },
  { name: "issuing_nb_contact", label: "Issuing NB Contact" },
  { name: "secretariat_contact", label: "Secretariat Contact" },
]

function FormSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export default function EditPolicyPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  useEffect(() => {
    getMe().catch(() => router.push("/login"))
    getPolicy(id).then((data) => {
      setForm(data)
      setLoading(false)
    })
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updatePolicy(id, form)
      router.push("/policies")
    } catch (err) {
      console.error(err)
      alert("Failed to update policy")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Edit Policy">
      <div className="space-y-6">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
          <Link href="/policies">
            <ArrowLeft className="h-4 w-4" /> Back to Policies
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Form */}
          <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Edit Policy</CardTitle>
                  {!loading && <p className="text-sm text-muted-foreground">{form.yellow_card_number}</p>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <FormSkeleton />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id={field.name}
                          value={form[field.name] || ""}
                          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                          required={field.required}
                          className="h-10 bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700/50 rounded-xl"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-border dark:border-slate-800/50">
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 rounded-xl"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Update Policy"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          {!loading && form.yellow_card_number && (
            <QRCodeGenerator yellowCardNumber={form.yellow_card_number} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
