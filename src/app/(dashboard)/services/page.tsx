import { createClient } from '@/lib/supabase/server'
import { ServiceCard } from '@/components/services/service-card'
import { AddServiceDialog } from '@/components/services/add-service-dialog'
import { Service, RevenueEntry } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: Pick<RevenueEntry, 'amount'>[] }

async function getServicesWithRevenue(): Promise<ServiceWithRevenue[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('*, revenue_entries(amount)')
    .order('created_at', { ascending: false })
  return (data || []) as ServiceWithRevenue[]
}

export default async function ServicesPage() {
  const services = await getServicesWithRevenue()

  const activeCount = services.filter(s => s.status === 'active').length
  const testCount = services.filter(s => s.status === 'test').length
  const paidCount = services.filter(s => s.is_paid).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">서비스 목록</h1>
          <p className="text-muted-foreground mt-1">
            전체 {services.length}개 · 운영 중 {activeCount}개 · 테스트 {testCount}개 · 유료 {paidCount}개
          </p>
        </div>
        <AddServiceDialog />
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">아직 등록된 서비스가 없습니다</p>
          <p className="text-sm mt-2">첫 번째 서비스를 추가해보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
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
