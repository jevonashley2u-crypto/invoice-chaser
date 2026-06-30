import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, AlertCircle, TrendingUp, Activity, CalendarClock } from "lucide-react"

interface OverviewCardsProps {
  metrics: {
    todayRevenue: number
    monthlyRevenue: number
    outstandingCount: number
    outstandingAmount: number
    overdueCount: number
    overdueAmount: number
    upcomingCount: number
    upcomingAmount: number
    healthScore: number
  }
}

export function OverviewCards({ metrics }: OverviewCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 50) return "text-amber-500"
    return "text-rose-500"
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Revenue Card */}
      <Card className="group relative overflow-hidden bg-background/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-200">
            {formatCurrency(metrics.monthlyRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="font-medium text-emerald-500">+{formatCurrency(metrics.todayRevenue)}</span> today
          </p>
        </CardContent>
      </Card>

      {/* Outstanding Invoices Card */}
      <Card className="group relative overflow-hidden bg-background/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
          <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
            <FileText className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(metrics.outstandingAmount)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {metrics.outstandingCount} active invoices
          </p>
        </CardContent>
      </Card>

      {/* Overdue Invoices Card */}
      <Card className="group relative overflow-hidden bg-background/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Balance</CardTitle>
          <div className="p-2 bg-rose-500/10 rounded-full text-rose-500">
            <AlertCircle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(metrics.overdueAmount)}
          </div>
          <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">
            {metrics.overdueCount > 0 ? `${metrics.overdueCount} invoices require attention` : "All caught up!"}
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Payments Card */}
      <Card className="group relative overflow-hidden bg-background/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expected Next 7 Days</CardTitle>
          <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
            <CalendarClock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(metrics.upcomingAmount)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            From {metrics.upcomingCount} scheduled payments
          </p>
        </CardContent>
      </Card>

      {/* Business Health Score Card */}
      <Card className="group relative overflow-hidden bg-background/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 md:col-span-2 lg:col-span-2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Business Health Score</CardTitle>
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Activity className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative h-20 w-20 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                className={getHealthColor(metrics.healthScore)}
                strokeDasharray={`${(metrics.healthScore / 100) * 283} 283`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-xl font-bold ${getHealthColor(metrics.healthScore)}`}>{metrics.healthScore}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-semibold text-lg">
              {metrics.healthScore >= 80 ? 'Excellent' : metrics.healthScore >= 50 ? 'Needs Attention' : 'Critical'}
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Based on your ratio of paid invoices to overdue invoices.
              {metrics.overdueCount > 0 ? " Chase up your overdue invoices to improve your score." : " Great job keeping your accounts clear!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
