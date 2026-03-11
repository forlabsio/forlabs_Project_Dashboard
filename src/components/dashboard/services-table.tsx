import Link from 'next/link'
import { Service, RevenueEntry } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: Pick<RevenueEntry, 'amount'>[] }

const statusColors: Record<string, string> = {
  active: 'badge-active',
  paused: 'badge-paused',
  killed: 'badge-killed',
  test:   'badge-test',
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
    <div className="plane-card p-4 h-full">
      <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">매출 Top 5 서비스</p>
      {sorted.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-4 text-[13px]">데이터 없음</p>
      ) : (
        <div className="space-y-1">
          {sorted.map((service, idx) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="flex items-center justify-between py-2 hover:bg-[var(--surface-3)] rounded-md px-2 -mx-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-[var(--text-muted)] w-4">{idx + 1}</span>
                <div>
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">{service.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full plane-badge ${statusColors[service.status] ?? ''}`}>
                    {statusLabels[service.status] ?? service.status}
                  </span>
                </div>
              </div>
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">₩{service.total.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}