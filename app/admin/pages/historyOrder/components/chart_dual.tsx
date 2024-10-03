"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const description = "A dual-axis chart with bars and a line"

const chartData = [
  { month: "จันทร์", desktop: 186, trend: 150 },
  { month: "อังคาร", desktop: 305, trend: 220 },
  { month: "พุธ", desktop: 237, trend: 300 },
  { month: "พฤหัสบดี", desktop: 420, trend: 420 },  // April as the highest bar
  { month: "ศุกร์", desktop: 209, trend: 380 },
  { month: "เสาร์", desktop: 214, trend: 450 },
  { month: "อาทิตย์", desktop: 300, trend: 500 },
]

const chartConfig = {
  desktop: {
    label: "Profit",
    color: "#4EA926", // Orange color for bars
  },
  trend: {
    label: "Trend",
    color: "#FFB800", // Lighter orange color for the trend line
  },
}

export function DualAxisChart() {
  return (
    <Card className="max-w-lg mx-auto p-1 shadow-md rounded-3xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-DB_Med text-gray-700">ยอดเงินรวม</CardTitle>
          <TrendingUp className="h-5 w-5 text-orange-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-DB_Med text-green-700">฿2,999</div>
        <div className="flex items-center gap-2 text-green-500 my-2 mt-5" >
          <span className="text-xs font-semibold inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full border border-teal-500 text-teal-500 bg-green-50">▲ 12%</span>
          <span className="text-sm text-gray-500 font-DB_Med">เทียบจากของเดือนที่แล้ว</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)} // Format month as short names
            />
            <YAxis hide={true} />
            <Tooltip cursor={false} />
            <Bar dataKey="desktop" fill={chartConfig.desktop.color} radius={[10, 10, 0, 0]} />
            <Line
              type="monotone"
              dataKey="trend"
              stroke={chartConfig.trend.color}
              strokeWidth={2.5}
              dot={{ stroke: chartConfig.trend.color, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="pt-4">
        <div className="text-sm text-gray-500">
          Showing total profits for the last 7 months
        </div>
      </CardFooter>
    </Card>
  )
}

export default DualAxisChart
