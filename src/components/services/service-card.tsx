import Link from 'next/link'
import { Service, RevenueEntry } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export function ServiceCard({ service, totalRevenue = 0 }: ServiceCardProps) {
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
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
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
