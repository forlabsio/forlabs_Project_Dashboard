import { createClient } from '@/lib/supabase/server'
import { AddServiceDialog } from '@/components/services/add-service-dialog'
import { ServicesFilter } from '@/components/services/services-filter'
import { Service, RevenueEntry } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: Pick<RevenueEntry, 'amount'>[] }

async function getServicesWithRevenue(): Promise<ServiceWithRevenue[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('services')
    .select('*, revenue_entries(amount)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return (data || []) as ServiceWithRevenue[]
}

export default async function ServicesPage() {
  const services = await getServicesWithRevenue()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)]">서비스 목록</h1>
        </div>
        <AddServiceDialog />
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-[14px] text-[var(--text-muted)]">아직 등록된 서비스가 없습니다</p>
          <p className="text-sm mt-2">첫 번째 서비스를 추가해보세요!</p>
        </div>
      ) : (
        <ServicesFilter services={services} />
      )}
    </div>
  )
}
