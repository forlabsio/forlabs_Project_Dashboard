'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Service } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditServiceDialog } from './edit-service-dialog'
import { ExternalLink, TrendingUp, MoreVertical, Pencil, Trash2 } from 'lucide-react'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  killed: 'bg-red-100 text-red-800',
  test: 'bg-blue-100 text-blue-800',
}

const statusLabels: Record<string, string> = {
  active: '운영 중',
  paused: '일시정지',
  killed: '종료',
  test: '테스트',
}

interface ServiceCardProps {
  service: Service
  totalRevenue?: number
}

type HealthStatus = 'checking' | 'up' | 'down' | 'unknown'

function HealthDot({ status }: { status: HealthStatus }) {
  if (status === 'unknown') return null
  const colors: Record<HealthStatus, string> = {
    checking: 'bg-gray-300 animate-pulse',
    up: 'bg-green-500',
    down: 'bg-red-500',
    unknown: '',
  }
  const titles: Record<HealthStatus, string> = {
    checking: '확인 중', up: '접속 가능', down: '접속 불가', unknown: '',
  }
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`} title={titles[status]} />
}

export function ServiceCard({ service, totalRevenue = 0 }: ServiceCardProps) {
  const router = useRouter()
  const [health, setHealth] = useState<HealthStatus>(service.url ? 'checking' : 'unknown')
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (!service.url) return
    // 클라이언트에서 직접 체크 - no-cors로 CORS 우회, 응답이 오면 up
    fetch(service.url, { mode: 'no-cors', cache: 'no-store' })
      .then(() => setHealth('up'))
      .catch(() => setHealth('down'))
  }, [service.url])

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm(`"${service.name}"을(를) 삭제하시겠어요?`)) return
    await fetch(`/api/services/${service.id}`, { method: 'DELETE' })
    router.refresh()
  }

  function handleEdit(e: React.MouseEvent) {
    e.preventDefault()
    setEditOpen(true)
  }

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault()
    if (service.url) window.open(service.url, '_blank')
  }

  return (
    <>
      <Link href={`/services/${service.id}`} className="block h-full">
        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{service.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1 h-4">
                  {service.category ?? ''}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[service.status]}`}>
                  {statusLabels[service.status]}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
              {service.description ?? ''}
            </p>
            <div className="mt-auto space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  <span>₩{totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {service.is_paid && (
                    <Badge variant="secondary" className="text-xs">유료</Badge>
                  )}
                  {service.url && (
                    <div className="flex items-center gap-1.5">
                      <HealthDot status={health} />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={handleOpen}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        열기
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground h-4">
                {service.launch_date
                  ? `런칭: ${new Date(service.launch_date).toLocaleDateString('ko-KR')}`
                  : '런칭일 미정'}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
      <EditServiceDialog service={service} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
