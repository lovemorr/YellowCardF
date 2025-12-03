"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchApi, getMe } from "@/lib/api"
import { Users2, Loader2, CheckCircle, AlertCircle, User, Lock } from "lucide-react"

export default function UsersPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getMe().catch(() => router.push("/login"))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetchApi("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage("User created successfully!")
        setIsSuccess(true)
        setUsername("")
        setPassword("")
      } else {
        setMessage(data.error || "Failed to create user")
        setIsSuccess(false)
      }
    } catch {
      setMessage("Connection error")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Users">
      <div className="max-w-lg">
        <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Users2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Add Admin User</CardTitle>
                <CardDescription className="text-muted-foreground">Create a new admin account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-10 pl-10 bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700/50 rounded-xl"
                    placeholder="Enter username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 pl-10 bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700/50 rounded-xl"
                    placeholder="Enter password"
                  />
                </div>
              </div>
              {message && (
                <div className={`flex items-center gap-2 rounded-xl p-3 ${
                  isSuccess 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-500'
                }`}>
                  {isSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <p className="text-sm">{message}</p>
                </div>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users2 className="mr-2 h-4 w-4" />
                    Create User
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
