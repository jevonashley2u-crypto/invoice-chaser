import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Clock, FileText, UserPlus, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export type ActivityType = 'invoice_created' | 'invoice_paid' | 'client_added'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string // ISO string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'invoice_created':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'invoice_paid':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'client_added':
        return <UserPlus className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getBgColor = (type: ActivityType) => {
    switch (type) {
      case 'invoice_created':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'invoice_paid':
        return 'bg-emerald-500/10 border-emerald-500/20'
      case 'client_added':
        return 'bg-purple-500/10 border-purple-500/20'
      default:
        return 'bg-muted border-border'
    }
  }

  return (
    <Card className="col-span-full lg:col-span-3 bg-background/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across your business</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground h-40">
            <Clock className="h-8 w-8 mb-2 opacity-20" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 group">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${getBgColor(activity.type)} transition-transform group-hover:scale-110`}>
                  {getIcon(activity.type)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground/60">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
