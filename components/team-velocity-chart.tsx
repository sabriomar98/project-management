"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { sprint: "Sprint 1", completed: 25, planned: 30 },
  { sprint: "Sprint 2", completed: 32, planned: 35 },
  { sprint: "Sprint 3", completed: 28, planned: 30 },
  { sprint: "Sprint 4", completed: 40, planned: 40 },
  { sprint: "Sprint 5", completed: 35, planned: 38 },
]

export function TeamVelocityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Velocity Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sprint" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="planned" stroke="hsl(var(--chart-1))" name="Planned" />
            <Line type="monotone" dataKey="completed" stroke="hsl(var(--chart-2))" name="Completed" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
