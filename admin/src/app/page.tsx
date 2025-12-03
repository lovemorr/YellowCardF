"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getPolicies, getMe } from "@/lib/api"
import { FileText, TrendingUp, ArrowUpRight, Activity, Database, Globe2 } from "lucide-react"
import Link from "next/link"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface Policy {
  id: number
  yellow_card_number: string
  customer_name: string
  valid_from: string
  valid_upto: string
  created_at: string
}

function StatSkeleton() {
  return (
    <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function RecentSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 dark:bg-slate-800/30">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getMe()
      .then(() => {
        setAuthChecking(false)
        return getPolicies()
      })
      .then((data) => {
        setPolicies(data)
        setLoading(false)
      })
      .catch(() => router.push("/login"))
  }, [router])

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 rounded-xl bg-blue-500/30 animate-ping" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  const totalPolicies = policies.length
  const recentPolicies = policies.slice(0, 5)
  const zmPolicies = policies.filter(p => p.yellow_card_number?.startsWith('ZM')).length
  const zwPolicies = policies.filter(p => p.yellow_card_number?.startsWith('ZW')).length
  const tzPolicies = policies.filter(p => p.yellow_card_number?.startsWith('TZ')).length
  const otherPolicies = totalPolicies - zmPolicies - zwPolicies - tzPolicies

  const pieData = [
    { name: 'Zambia', value: zmPolicies, color: '#3b82f6' },
    { name: 'Zimbabwe', value: zwPolicies, color: '#6366f1' },
    { name: 'Tanzania', value: tzPolicies, color: '#8b5cf6' },
    { name: 'Other', value: otherPolicies, color: '#1e40af' },
  ].filter(d => d.value > 0)

  const prefixCounts: Record<string, number> = {}
  policies.forEach(p => {
    const prefix = p.yellow_card_number?.substring(0, 2) || 'XX'
    prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1
  })
  const barData = Object.entries(prefixCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const monthlyData = [
    { month: 'Jul', policies: Math.floor(totalPolicies * 0.6) },
    { month: 'Aug', policies: Math.floor(totalPolicies * 0.7) },
    { month: 'Sep', policies: Math.floor(totalPolicies * 0.75) },
    { month: 'Oct', policies: Math.floor(totalPolicies * 0.85) },
    { month: 'Nov', policies: Math.floor(totalPolicies * 0.95) },
    { month: 'Dec', policies: totalPolicies },
  ]

  const stats = [
    {
      title: "Total Policies",
      value: totalPolicies,
      description: "All registered policies",
      icon: Database,
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
    },
    {
      title: "Zambian (ZM)",
      value: zmPolicies,
      description: "ZM prefix policies",
      icon: Globe2,
      gradient: "from-indigo-500 to-indigo-600",
      shadow: "shadow-indigo-500/20",
    },
    {
      title: "Zimbabwean (ZW)",
      value: zwPolicies,
      description: "ZW prefix policies",
      icon: Activity,
      gradient: "from-violet-500 to-violet-600",
      shadow: "shadow-violet-500/20",
    },
    {
      title: "Growth",
      value: "+12%",
      description: "vs last month",
      icon: TrendingUp,
      gradient: "from-cyan-500 to-cyan-600",
      shadow: "shadow-cyan-500/20",
    },
  ]

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            stats.map((stat, index) => (
              <Card 
                key={stat.title} 
                className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm hover:bg-accent/50 dark:hover:bg-slate-900/80 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`rounded-xl p-2.5 bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Pie Chart */}
              <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">Distribution by Country</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-muted-foreground">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">Policies by Prefix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={30} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                          }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 6, 6, 0]} />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Area Chart */}
              <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">Growth Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                          }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="policies" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#areaGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent Policies */}
        <Card className="border-border dark:border-slate-800/50 bg-card dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground">Recent Policies</CardTitle>
            </div>
            <Link 
              href="/policies" 
              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group"
            >
              View all <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <RecentSkeleton />
            ) : recentPolicies.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No policies found</p>
            ) : (
              <div className="space-y-2">
                {recentPolicies.map((policy, index) => (
                  <div 
                    key={policy.id} 
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-slate-800/30 hover:bg-muted dark:hover:bg-slate-800/50 transition-all duration-200 group cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-transform group-hover:scale-105 ${
                        policy.yellow_card_number?.startsWith('ZM') 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20' 
                          : policy.yellow_card_number?.startsWith('ZW')
                          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/20'
                          : 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-violet-500/20'
                      }`}>
                        {policy.yellow_card_number?.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{policy.yellow_card_number}</p>
                        <p className="text-sm text-muted-foreground">{policy.customer_name || "N/A"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {policy.valid_from} <span className="text-muted-foreground/50">→</span> {policy.valid_upto}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
