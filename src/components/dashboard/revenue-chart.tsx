'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueEntry } from '@/types'

interface RevenueChartProps {
  entries: RevenueEntry[]
}

export function RevenueChart({ entries }: RevenueChartProps) {
  // Generate last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    return {
      month: d.toISOString().substring(0, 7),
      label: `${d.getMonth() + 1}월`,
      total: 0,
    }
  })

  entries.forEach(entry => {
    const entryMonth = entry.entry_date.substring(0, 7)
    const monthData = months.find(m => m.month === entryMonth)
    if (monthData) monthData.total += Number(entry.amount)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">월별 총 매출 (최근 6개월)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={months}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v: number) => v >= 1000 ? `₩${(v / 1000).toFixed(0)}K` : `₩${v}`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: number | string | undefined) => [`₩${Number(value ?? 0).toLocaleString()}`, '매출']}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
