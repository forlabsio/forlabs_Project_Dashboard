import { createClient } from '@/lib/supabase/server'
import { ServiceRevenueChart } from '@/components/analytics/service-revenue-chart'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">분석</h1>
        <p className="text-muted-foreground mt-1">서비스 포트폴리오 인사이트</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
            <p className="text-sm text-muted-foreground">운영 중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.paused}</p>
            <p className="text-sm text-muted-foreground">일시정지</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-red-600">{statusCounts.killed}</p>
            <p className="text-sm text-muted-foreground">종료</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{launchPace}개/주</p>
            <p className="text-sm text-muted-foreground">런칭 페이스</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RevenueChart entries={revenues} />
        <ServiceRevenueChart data={serviceRevenue} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">서비스별 매출 상세</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceRevenue.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">데이터 없음</p>
          ) : (
            <div className="space-y-2">
              {serviceRevenue
                .sort((a, b) => b.value - a.value)
                .map((item, idx) => {
                  const percentage = Math.round((item.value / maxRevenue) * 100)
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <p className="text-sm w-40 truncate">{item.name}</p>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium w-28 text-right">₩{item.value.toLocaleString()}</p>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
