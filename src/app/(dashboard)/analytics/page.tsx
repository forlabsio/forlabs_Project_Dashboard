import { createClient } from '@/lib/supabase/server'
import { ServiceRevenueChart } from '@/components/analytics/service-revenue-chart'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { Service, RevenueEntry } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: RevenueEntry[] }

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const [servicesResult, allRevenueResult] = await Promise.all([
    supabase.from('services').select('*, revenue_entries(*)'),
    supabase.from('revenue_entries').select('*'),
  ])

  const services = (servicesResult.data || []) as ServiceWithRevenue[]
  const revenues = (allRevenueResult.data || []) as RevenueEntry[]

  const serviceRevenue = services.map(s => ({
    name: s.name,
    value: s.revenue_entries.reduce((sum, e) => sum + Number(e.amount), 0),
  }))

  const statusCounts = {
    active: services.filter(s => s.status === 'active').length,
    paused: services.filter(s => s.status === 'paused').length,
    test: services.filter(s => s.status === 'test').length,
    killed: services.filter(s => s.status === 'killed').length,
  }

  const launchedServices = services.filter(s => s.launch_date)
  const oldestLaunch = launchedServices.sort(
    (a, b) => new Date(a.launch_date!).getTime() - new Date(b.launch_date!).getTime()
  )[0]
  const weeksSinceFirst = oldestLaunch
    ? Math.max(1, Math.round((Date.now() - new Date(oldestLaunch.launch_date!).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : 1
  const launchPace = (services.length / weeksSinceFirst).toFixed(1)

  const maxRevenue = Math.max(...serviceRevenue.map(s => s.value), 1)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-[var(--text-primary)]">분석</h1>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">서비스 포트폴리오 인사이트</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {[
          { count: statusCounts.active, label: '운영 중', color: 'text-[var(--accent)]' },
          { count: statusCounts.paused, label: '일시정지', color: 'text-[var(--text-muted)]' },
          { count: statusCounts.test, label: '테스트', color: 'text-[var(--sky)]' },
          { count: statusCounts.killed, label: '종료', color: 'text-[var(--rose)]' },
        ].map(({ count, label, color }) => (
          <div key={label} className="plane-card p-4">
            <p className={`text-[22px] font-bold ${color}`}>{count}</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{label}</p>
          </div>
        ))}
        <div className="plane-card p-4">
          <p className="text-[22px] font-bold text-[var(--text-primary)]">{launchPace}개/주</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">런칭 페이스</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <RevenueChart entries={revenues} />
        <ServiceRevenueChart data={serviceRevenue} />
      </div>

      <div className="plane-card p-4">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">서비스별 매출 상세</p>
        {serviceRevenue.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-4 text-[13px]">데이터 없음</p>
        ) : (
          <div className="space-y-2">
            {serviceRevenue
              .sort((a, b) => b.value - a.value)
              .map((item, idx) => {
                const percentage = Math.round((item.value / maxRevenue) * 100)
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <p className="text-[13px] text-[var(--text-primary)] w-40 truncate">{item.name}</p>
                    <div className="flex-1 bg-[var(--surface-3)] rounded-full h-2">
                      <div
                        className="bg-[var(--accent)] h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)] w-28 text-right">₩{item.value.toLocaleString()}</p>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
