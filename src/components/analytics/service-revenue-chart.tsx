'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface ServiceRevenueChartProps {
  data: { name: string; value: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

export function ServiceRevenueChart({ data }: ServiceRevenueChartProps) {
  const filtered = data.filter(d => d.value > 0)

  return (
    <div className="plane-card p-4">
      <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-4">서비스별 매출</p>
      {filtered.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-8 text-[13px]">매출 데이터 없음</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={filtered}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {filtered.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number | undefined) => v != null ? `₩${v.toLocaleString()}` : ''} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
