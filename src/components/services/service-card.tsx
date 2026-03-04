'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Service } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, TrendingUp } from 'lucide-react'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  killed: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  active: '운영 중',
  paused: '일시정지',
  killed: '종료',
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
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} title={status === 'up' ? '접속 가능' : status === 'down' ? '접속 불가' : '확인 중'} />
}

export function ServiceCard({ service, totalRevenue = 0 }: ServiceCardProps) {
  const [health, setHealth] = useState<HealthStatus>(service.url ? 'checking' : 'unknown')

  useEffect(() => {
    if (!service.url) return
    fetch(`/api/health-check?url=${encodeURIComponent(service.url)}`)
      .then((r) => r.json())
      .then((data) => setHealth(data.status === 'up' ? 'up' : 'down'))
      .catch(() => setHealth('down'))
  }, [service.url])

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault()
    if (service.url) window.open(service.url, '_blank')
  }

  return (
    <Link href={`/services/${service.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{service.name}</CardTitle>
              {service.category && (
                <p className="text-xs text-muted-foreground mt-1">{service.category}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[service.status]}`}>
              {statusLabels[service.status]}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {service.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{service.description}</p>
          )}
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
          {service.launch_date && (
            <p className="text-xs text-muted-foreground mt-2">
              런칭: {new Date(service.launch_date).toLocaleDateString('ko-KR')}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
