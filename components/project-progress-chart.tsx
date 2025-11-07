"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Project A", completed: 45, inProgress: 20, todo: 15 },
  { name: "Project B", completed: 30, inProgress: 25, todo: 10 },
  { name: "Project C", completed: 55, inProgress: 15, todo: 5 },
  { name: "Project D", completed: 20, inProgress: 30, todo: 25 },
]

export function ProjectProgressChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Progress Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" fill="hsl(var(--chart-1))" name="Completed" />
            <Bar dataKey="inProgress" fill="hsl(var(--chart-2))" name="In Progress" />
            <Bar dataKey="todo" fill="hsl(var(--chart-3))" name="To Do" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
