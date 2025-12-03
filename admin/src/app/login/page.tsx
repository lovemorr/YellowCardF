"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/lib/api"
import { Zap, Loader2, Lock, User } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await login(username, password)
      if (data.success) {
        router.push("/")
      } else {
        setError(data.error || "Login failed")
      }
    } catch {
      setError("Connection error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 dark:from-blue-600/10 dark:to-indigo-600/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md border-border dark:border-slate-800/50 bg-card/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl relative">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-6 relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="absolute inset-0 h-16 w-16 rounded-2xl bg-blue-400/30 animate-ping" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            e<span className="text-blue-500">-</span>YC Admin
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to manage Yellow Card policies
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 pl-10 bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                  placeholder="Enter your username"
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
                  className="h-12 pl-10 bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:-translate-y-0.5 rounded-xl" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
