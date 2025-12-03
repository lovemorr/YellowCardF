"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { createPolicy, getMe, getNBContact } from "@/lib/api"
import { FilePlus2, Loader2, ArrowLeft, CheckCircle, Plus } from "lucide-react"
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

const DEFAULT_SECRETARIAT_CONTACT = "COMESA Secretariat P.O. Box 30051 +260 211 229725/32 yellowcard@comesa.int"

export default function NewPolicyPage() {
  const [form, setForm] = useState<Record<string, string>>({
    secretariat_contact: DEFAULT_SECRETARIAT_CONTACT
  })
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(false)
  const [createdYellowCard, setCreatedYellowCard] = useState("")
  const router = useRouter()

  const [lastPrefix, setLastPrefix] = useState("")

  useEffect(() => {
    getMe().catch(() => router.push("/login"))
  }, [router])

  // Auto-fill NB contact based on country prefix
  const handleYellowCardChange = async (value: string) => {
    setForm({ ...form, yellow_card_number: value })
    
    // Extract country prefix (first 2 letters)
    const prefix = value.substring(0, 2).toUpperCase()
    
    // Only fetch if prefix changed and is 2+ chars, and NB contact is empty
    if (prefix.length >= 2 && prefix !== lastPrefix && !form.issuing_nb_contact) {
      setLastPrefix(prefix)
      try {
        const result = await getNBContact(prefix)
        if (result.issuing_nb_contact) {
          setForm(prev => ({ 
            ...prev, 
            yellow_card_number: value,
            issuing_nb_contact: result.issuing_nb_contact 
          }))
        }
      } catch (err) {
        // Silently fail - just don't prefill
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await createPolicy(form)
      setCreatedYellowCard(result.yellow_card_number)
      setCreated(true)
    } catch (err) {
      console.error(err)
      alert("Failed to create policy")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAnother = () => {
    setForm({ secretariat_contact: DEFAULT_SECRETARIAT_CONTACT })
    setCreated(false)
    setCreatedYellowCard("")
  }

  // Success state - show QR code
  if (created) {
    return (
      <DashboardLayout title="Policy Created">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Policy Created Successfully!</h2>
                <p className="text-muted-foreground mt-1">Yellow Card: {createdYellowCard}</p>
              </div>
            </CardContent>
          </Card>

          <QRCodeGenerator yellowCardNumber={createdYellowCard} />

          <div className="flex gap-4">
            <Button
              onClick={handleAddAnother}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another
            </Button>
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl"
            >
              <Link href="/policies">View All Policies</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Add Policy">
      <div className="space-y-6">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
          <Link href="/policies">
            <ArrowLeft className="h-4 w-4" /> Back to Policies
          </Link>
        </Button>

        <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="border-b border-border dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FilePlus2 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground">New Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
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
                      onChange={(e) => 
                        field.name === "yellow_card_number" 
                          ? handleYellowCardChange(e.target.value)
                          : setForm({ ...form, [field.name]: e.target.value })
                      }
                      required={field.required}
                      className="h-10 bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700/50 rounded-xl"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-4 border-t border-border dark:border-slate-800/50">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Policy"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
