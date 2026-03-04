import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Service, RevenueEntry } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: Pick<RevenueEntry, 'amount'>[] }

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  killed: 'bg-red-100 text-red-800',
  test: 'bg-blue-100 text-blue-800',
}
const statusLabels: Record<string, string> = { active: '운영 중', paused: '일시정지', killed: '종료', test: '테스트' }

export function ServicesTable({ services }: { services: ServiceWithRevenue[] }) {
  const sorted = [...services]
    .map(s => ({
      ...s,
      total: s.revenue_entries.reduce((sum, e) => sum + Number(e.amount), 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">매출 Top 5 서비스</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">데이터 없음</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((service, idx) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[service.status] ?? ''}`}>
                      {statusLabels[service.status] ?? service.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold">₩{service.total.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
