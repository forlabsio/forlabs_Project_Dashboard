'use client'

import { useState } from 'react'
import { ServiceCard } from './service-card'
import { Service, RevenueEntry } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: Pick<RevenueEntry, 'amount'>[] }

const filters = [
  { label: '전체', value: 'all' },
  { label: '운영 중', value: 'active' },
  { label: '테스트', value: 'test' },
  { label: '일시정지', value: 'paused' },
  { label: '종료', value: 'killed' },
]

export function ServicesFilter({ services }: { services: ServiceWithRevenue[] }) {
  const [active, setActive] = useState('all')

  const filtered = active === 'all' ? services : services.filter(s => s.status === active)

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-70">
              {f.value === 'all' ? services.length : services.filter(s => s.status === f.value).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">해당 상태의 서비스가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(service => (
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
