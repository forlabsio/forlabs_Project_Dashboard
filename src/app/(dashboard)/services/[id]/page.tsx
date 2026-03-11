import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RevenueForm } from '@/components/services/revenue-form'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { RevenueEntry } from '@/types'

const statusLabels: Record<string, string> = { active: '운영 중', paused: '일시정지', killed: '종료', test: '테스트' }
const statusColors: Record<string, string> = {
  active: 'badge-active',
  paused: 'badge-paused',
  killed: 'badge-killed',
  test:   'badge-test',
}
const revenueTypeLabels: Record<string, string> = {
  'one-time': '일회성', subscription: '구독', ads: '광고', other: '기타'
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: service, error } = await supabase
    .from('services')
    .select('*, revenue_entries(*)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (error || !service) notFound()

  const revenues: RevenueEntry[] = (service.revenue_entries || []) as RevenueEntry[]
  const totalRevenue = revenues.reduce((sum, e) => sum + Number(e.amount), 0)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const monthlyRevenue = revenues
    .filter(e => e.entry_date >= thirtyDaysAgo)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div>
      <div className="mb-6">
        <Link href="/services" className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          서비스 목록
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[20px] font-bold text-[var(--text-primary)]">{service.name}</h1>
              <span className={`plane-badge ${statusColors[service.status] ?? ''}`}>
                {statusLabels[service.status] ?? service.status}
              </span>
            </div>
            {service.description && (
              <p className="text-[13px] text-[var(--text-muted)] mt-1">{service.description}</p>
            )}
          </div>
          {service.url && (
            <a href={service.url} target="_blank" rel="noopener noreferrer"
              className="plane-btn-outline flex items-center gap-2 px-3 py-2">
              <ExternalLink className="h-4 w-4" />
              방문하기
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="plane-card-inner p-4">
          <p className="text-[22px] font-bold text-[var(--text-primary)]">₩{totalRevenue.toLocaleString()}</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">총 매출</p>
        </div>
        <div className="plane-card-inner p-4">
          <p className="text-[22px] font-bold text-[var(--text-primary)]">₩{monthlyRevenue.toLocaleString()}</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">최근 30일 매출</p>
        </div>
        <div className="plane-card-inner p-4">
          <p className="text-[22px] font-bold text-[var(--text-primary)]">{revenues.length}건</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">총 거래 수</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="plane-card p-4">
            <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">매출 기록</p>
            {revenues.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-8 text-[13px]">아직 매출 기록이 없습니다</p>
            ) : (
              <div className="space-y-1">
                {revenues
                  .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                      <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">₩{Number(entry.amount).toLocaleString()}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {new Date(entry.entry_date).toLocaleDateString('ko-KR')} · {revenueTypeLabels[entry.revenue_type] ?? entry.revenue_type}
                        </p>
                        {entry.note && <p className="text-[11px] text-[var(--text-muted)]">{entry.note}</p>}
                      </div>
                      <span className="plane-badge bg-[var(--surface-3)] text-[var(--text-muted)]">
                        {revenueTypeLabels[entry.revenue_type] ?? entry.revenue_type}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <RevenueForm serviceId={id} />
        </div>
      </div>
    </div>
  )
}