import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RevenueForm } from '@/components/services/revenue-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { RevenueEntry, Service } from '@/types'

const statusLabels: Record<string, string> = { active: '운영 중', paused: '일시정지', killed: '종료', test: '테스트' }
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  killed: 'bg-red-100 text-red-800',
  test: 'bg-blue-100 text-blue-800',
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

  const { data: service, error } = await supabase
    .from('services')
    .select('*, revenue_entries(*)')
    .eq('id', id)
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
        <Link href="/services" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          서비스 목록
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{service.name}</h1>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[service.status] ?? ''}`}>
                {statusLabels[service.status] ?? service.status}
              </span>
            </div>
            {service.description && (
              <p className="text-muted-foreground mt-1">{service.description}</p>
            )}
          </div>
          {service.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={service.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                방문하기
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">₩{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">총 매출</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">₩{monthlyRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">최근 30일 매출</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{revenues.length}건</p>
            <p className="text-sm text-muted-foreground">총 거래 수</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">매출 기록</CardTitle>
            </CardHeader>
            <CardContent>
              {revenues.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">아직 매출 기록이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {revenues
                    .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
                    .map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">₩{Number(entry.amount).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.entry_date).toLocaleDateString('ko-KR')} · {revenueTypeLabels[entry.revenue_type] ?? entry.revenue_type}
                          </p>
                          {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {revenueTypeLabels[entry.revenue_type] ?? entry.revenue_type}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <RevenueForm serviceId={id} />
        </div>
      </div>
    </div>
  )
}
