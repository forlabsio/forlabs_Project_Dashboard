'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Service } from '@/types'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import { EditServiceDialog } from './edit-service-dialog'
import { ExternalLink, TrendingUp, MoreVertical, Pencil, Trash2 } from 'lucide-react'

const statusColors: Record<string, string> = {
  active: 'badge-active',
  paused: 'badge-paused',
  killed: 'badge-killed',
  test:   'badge-test',
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
    checking: 'bg-gray-400 animate-pulse',
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
    fetch(service.url, { mode: 'no-cors', cache: 'no-store' })
      .then(() => setHealth('up'))
      .catch(() => setHealth('down'))
  }, [service.url])

  async function handleDelete(e: Event) {
    e.preventDefault()
    if (!confirm(`"${service.name}"을(를) 삭제하시겠어요?`)) return
    await fetch(`/api/services/${service.id}`, { method: 'DELETE' })
    router.refresh()
  }

  function handleEdit(e: Event) {
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
        <div className="plane-card p-4 cursor-pointer h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{service.name}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 h-4 truncate">{service.category ?? ''}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`plane-badge ${statusColors[service.status] ?? ''}`}>
                {statusLabels[service.status]}
              </span>
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded-md plane-btn-ghost"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    className="plane-card z-50 p-1 min-w-[120px] shadow-lg"
                    align="end"
                    sideOffset={4}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuPrimitive.Item
                      className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] rounded-md cursor-pointer outline-none"
                      onSelect={handleEdit}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      수정
                    </DropdownMenuPrimitive.Item>
                    <DropdownMenuPrimitive.Separator className="my-1 h-px bg-[var(--border-subtle)]" />
                    <DropdownMenuPrimitive.Item
                      className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-red-600 hover:bg-red-500/10 rounded-md cursor-pointer outline-none"
                      onSelect={handleDelete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </DropdownMenuPrimitive.Item>
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          </div>

          {/* Description */}
          <p className="text-[12px] text-[var(--text-muted)] line-clamp-2 mb-3 flex-1">
            {service.description ?? ''}
          </p>

          {/* Footer */}
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[13px] font-medium text-[var(--text-primary)]">
                <TrendingUp className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>₩{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                {service.is_paid && (
                  <span className="plane-badge bg-[var(--accent)]/10 text-[var(--accent)]">유료</span>
                )}
                {service.url && (
                  <div className="flex items-center gap-1.5">
                    <HealthDot status={health} />
                    <button
                      className="plane-btn-outline h-6 px-2 text-[11px] flex items-center gap-1"
                      onClick={handleOpen}
                    >
                      <ExternalLink className="h-3 w-3" />
                      열기
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {service.launch_date
                ? `런칭: ${new Date(service.launch_date).toLocaleDateString('ko-KR')}`
                : '런칭일 미정'}
            </p>
          </div>
        </div>
      </Link>
      <EditServiceDialog service={service} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}