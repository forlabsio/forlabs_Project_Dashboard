import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { ServicesTable } from '@/components/dashboard/services-table'
import { Package, TrendingUp, Activity, DollarSign } from 'lucide-react'
import { RevenueEntry, Service } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: Pick<RevenueEntry, 'amount'>[] }

async function getDashboardData() {
  const supabase = await createClient()
  const [servicesResult, revenueResult] = await Promise.all([
    supabase.from('services').select('*, revenue_entries(amount)'),
    supabase.from('revenue_entries').select('*').order('entry_date', { ascending: false }),
  ])
  return {
    services: (servicesResult.data || []) as ServiceWithRevenue[],
    revenues: (revenueResult.data || []) as RevenueEntry[],
  }
}

export default async function DashboardPage() {
  const { services, revenues } = await getDashboardData()

  const totalRevenue = revenues.reduce((sum, e) => sum + Number(e.amount), 0)
  const activeServices = services.filter(s => s.status === 'active').length
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const monthlyRevenue = revenues
    .filter(e => e.entry_date >= thirtyDaysAgo)
    .reduce((sum, e) => sum + Number(e.amount), 0)
  const paidServices = services.filter(s => s.is_paid).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 기준
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="전체 서비스"
          value={`${services.length}개`}
          subtitle={`운영 중 ${activeServices}개`}
          icon={Package}
        />
        <StatsCard
          title="총 누적 매출"
          value={`₩${totalRevenue.toLocaleString()}`}
          subtitle={`거래 ${revenues.length}건`}
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <StatsCard
          title="최근 30일 매출"
          value={`₩${monthlyRevenue.toLocaleString()}`}
          icon={TrendingUp}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="유료 서비스"
          value={`${paidServices}개`}
          subtitle={`전체의 ${services.length > 0 ? Math.round(paidServices / services.length * 100) : 0}%`}
          icon={Activity}
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <RevenueChart entries={revenues} />
        </div>
        <div>
          <ServicesTable services={services} />
        </div>
      </div>
    </div>
  )
}
