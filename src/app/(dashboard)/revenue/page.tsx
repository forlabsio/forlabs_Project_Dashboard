import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { RevenueEntry, Service } from '@/types'

const revenueTypeLabels: Record<string, string> = {
  'one-time': '일회성', subscription: '구독', ads: '광고', other: '기타'
}
const revenueTypeBadge: Record<string, string> = {
  'one-time':   'badge-onetime',
  subscription: 'badge-subscription',
  ads:          'badge-ads',
  other:        'badge-other',
}

type RevenueWithService = RevenueEntry & { services: Pick<Service, 'name' | 'id'> | null }

export default async function RevenuePage() {
  const supabase = await createClient()
  const { data: revenues } = await supabase
    .from('revenue_entries')
    .select('*, services(name, id)')
    .order('entry_date', { ascending: false })
    .limit(100)

  const entries = (revenues || []) as RevenueWithService[]
  const totalRevenue = entries.reduce((sum, e) => sum + Number(e.amount), 0)

  const byType = entries.reduce((acc, e) => {
    acc[e.revenue_type] = (acc[e.revenue_type] ?? 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-[var(--text-primary)]">매출 관리</h1>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">총 누적 매출: ₩{totalRevenue.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {(['subscription', 'one-time', 'ads', 'other'] as const).map(type => (
          <div key={type} className="plane-card p-4">
            <p className="text-[11px] text-[var(--text-muted)]">{revenueTypeLabels[type]}</p>
            <p className="text-[20px] font-bold text-[var(--text-primary)] mt-0.5">₩{(byType[type] ?? 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="plane-card p-4">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">전체 매출 기록 (최근 100건)</p>
        {entries.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-8 text-[13px]">아직 매출 기록이 없습니다</p>
        ) : (
          <div>
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)] last:border-0">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">₩{Number(entry.amount).toLocaleString()}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {new Date(entry.entry_date).toLocaleDateString('ko-KR')}
                      {entry.note && ` · ${entry.note}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {entry.services && (
                    <Link href={`/services/${entry.services.id}`}
                      className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      {entry.services.name}
                    </Link>
                  )}
                  <span className={`plane-badge ${revenueTypeBadge[entry.revenue_type] ?? ''}`}>
                    {revenueTypeLabels[entry.revenue_type] ?? entry.revenue_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}