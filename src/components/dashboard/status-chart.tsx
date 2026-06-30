"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface StatusChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

export function StatusChart({ data }: StatusChartProps) {
  // Only show statuses that actually have invoices
  const filteredData = data.filter(item => item.value > 0)

  return (
    <Card className="col-span-full lg:col-span-3 bg-background/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>Invoices by Status</CardTitle>
        <CardDescription>Breakdown of all active invoices</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center h-[300px]">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
            <p>No invoices yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {filteredData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="hover:opacity-80 transition-opacity outline-none cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--background)", 
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  color: "var(--foreground)"
                }}
                itemStyle={{ fontWeight: "bold" }}
                formatter={(value: any) => [`${value} Invoices`, "Count"]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span className="text-sm font-medium text-foreground ml-1">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
