import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { RevenueEntry, Service } from '@/types'

const revenueTypeLabels: Record<string, string> = {
  'one-time': '일회성', subscription: '구독', ads: '광고', other: '기타'
}
const revenueTypeColors: Record<string, string> = {
  'one-time': 'bg-blue-100 text-blue-800',
  subscription: 'bg-green-100 text-green-800',
  ads: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">매출 관리</h1>
        <p className="text-muted-foreground mt-1">총 누적 매출: ₩{totalRevenue.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['subscription', 'one-time', 'ads', 'other'] as const).map(type => (
          <Card key={type}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{revenueTypeLabels[type]}</p>
              <p className="text-lg font-bold">₩{(byType[type] ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">전체 매출 기록 (최근 100건)</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">아직 매출 기록이 없습니다</p>
          ) : (
            <div>
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-medium">₩{Number(entry.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.entry_date).toLocaleDateString('ko-KR')}
                        {entry.note && ` · ${entry.note}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {entry.services && (
                      <Link href={`/services/${entry.services.id}`} className="text-xs text-muted-foreground hover:text-foreground">
                        {entry.services.name}
                      </Link>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${revenueTypeColors[entry.revenue_type] ?? ''}`}>
                      {revenueTypeLabels[entry.revenue_type] ?? entry.revenue_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
