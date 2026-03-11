'use client'

import { useState } from 'react'
import { ServiceCard } from './service-card'
import { Service, RevenueEntry } from '@/types'
import { ArrowUpDown } from 'lucide-react'

type ServiceWithRevenue = Service & { revenue_entries: Pick<RevenueEntry, 'amount'>[] }

type SortKey = 'status' | 'launch_desc' | 'launch_asc' | 'revenue_desc' | 'created_desc'

const STATUS_ORDER: Record<string, number> = { active: 0, test: 1, paused: 2, killed: 3 }

const filters = [
  { label: '전체', value: 'all' },
  { label: '운영 중', value: 'active' },
  { label: '테스트', value: 'test' },
  { label: '일시정지', value: 'paused' },
  { label: '종료', value: 'killed' },
]

const sortOptions: { label: string; value: SortKey }[] = [
  { label: '상태 순', value: 'status' },
  { label: '매출 높은 순', value: 'revenue_desc' },
  { label: '런칭일 최신 순', value: 'launch_desc' },
  { label: '런칭일 오래된 순', value: 'launch_asc' },
  { label: '등록일 최신 순', value: 'created_desc' },
]

function sortServices(services: ServiceWithRevenue[], sort: SortKey): ServiceWithRevenue[] {
  const arr = [...services]
  switch (sort) {
    case 'status':
      return arr.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9))
    case 'revenue_desc':
      return arr.sort((a, b) => {
        const ra = a.revenue_entries.reduce((s, e) => s + Number(e.amount), 0)
        const rb = b.revenue_entries.reduce((s, e) => s + Number(e.amount), 0)
        return rb - ra
      })
    case 'launch_desc':
      return arr.sort((a, b) => {
        if (!a.launch_date && !b.launch_date) return 0
        if (!a.launch_date) return 1
        if (!b.launch_date) return -1
        return new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime()
      })
    case 'launch_asc':
      return arr.sort((a, b) => {
        if (!a.launch_date && !b.launch_date) return 0
        if (!a.launch_date) return 1
        if (!b.launch_date) return -1
        return new Date(a.launch_date).getTime() - new Date(b.launch_date).getTime()
      })
    case 'created_desc':
    default:
      return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

export function ServicesFilter({ services }: { services: ServiceWithRevenue[] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSort, setActiveSort] = useState<SortKey>('status')

  const filtered = activeFilter === 'all' ? services : services.filter(s => s.status === activeFilter)
  const sorted = sortServices(filtered, activeSort)

  return (
    <div>
      {/* Filter + Sort bar */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                activeFilter === f.value
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'plane-btn-ghost'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-[10px] opacity-60">
                {f.value === 'all' ? services.length : services.filter(s => s.status === f.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <select
            value={activeSort}
            onChange={e => setActiveSort(e.target.value as SortKey)}
            className="plane-input px-2.5 py-1.5 text-[12px] pr-7"
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-[14px]">해당 상태의 서비스가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              totalRevenue={service.revenue_entries.reduce((sum, e) => sum + Number(e.amount), 0)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
