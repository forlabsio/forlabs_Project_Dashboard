import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
}

export function StatsCard({ title, value, subtitle, icon: Icon, iconColor = 'text-[var(--text-muted)]' }: StatsCardProps) {
  return (
    <div className="plane-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-[var(--text-muted)]">{title}</p>
          <p className="text-[22px] font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
          {subtitle && <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
        </div>
        <Icon className={`h-4 w-4 mt-0.5 ${iconColor}`} />
      </div>
    </div>
  )
}