'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { LayoutDashboard, Package, TrendingUp, BarChart3, LogOut, PanelLeftClose, Sun, Moon } from 'lucide-react'
import { signout } from '@/app/login/actions'

interface SidebarProps {
  userEmail?: string
}

function WorkspaceLogo() {
  return (
    <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center shrink-0">
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
        <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
        <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
        <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
      </svg>
    </div>
  )
}

const navItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard, exact: true },
  { href: '/services', label: '서비스', icon: Package, exact: false },
  { href: '/revenue', label: '수익', icon: TrendingUp, exact: false },
  { href: '/analytics', label: '애널리틱스', icon: BarChart3, exact: false },
]

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded')
    if (saved !== null) setExpanded(saved === 'true')
  }, [])

  const toggleExpanded = () => {
    const next = !expanded
    setExpanded(next)
    localStorage.setItem('sidebar-expanded', String(next))
  }

  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const displayName = userEmail?.split('@')[0] ?? 'User'
  const initial = displayName[0].toUpperCase()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const txt = `truncate whitespace-nowrap transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`

  const navCls = (href: string, exact: boolean) => {
    const active = isActive(href, exact)
    return `w-full flex items-center gap-2.5 px-2.5 py-[5px] rounded-md text-[13px] transition-colors ${
      active
        ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]'
    }`
  }

  const ghostCls = 'w-full flex items-center gap-2.5 px-2.5 py-[5px] rounded-md text-[13px] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]'

  return (
    <aside
      className={`flex flex-col shrink-0 bg-[var(--surface-2)] border-r border-[var(--border-subtle)] overflow-hidden transition-[width] duration-200 ease-in-out ${
        expanded ? 'w-[200px]' : 'w-[48px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center h-[44px] px-[6px] gap-1 border-b border-[var(--border-subtle)] shrink-0">
        <button
          onClick={toggleExpanded}
          className="w-9 h-9 flex items-center justify-center rounded-md hover:opacity-80 transition-opacity shrink-0"
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <WorkspaceLogo />
        </button>
        <span className={`text-[14px] font-bold text-[var(--text-primary)] flex-1 truncate whitespace-nowrap transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
          Forlabs Dashboard
        </span>
        <button
          onClick={toggleExpanded}
          className={`w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-[opacity,colors] duration-150 shrink-0 ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-[13px] h-[13px]" />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-1.5 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href} className={navCls(href, exact)}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className={txt}>{label}</span>
          </Link>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="px-1.5 py-1.5 border-t border-[var(--border-subtle)] shrink-0 space-y-0.5">
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className={ghostCls}
            title={resolvedTheme === 'dark' ? '라이트 모드' : '다크 모드'}
          >
            {resolvedTheme === 'dark'
              ? <Sun className="w-4 h-4 shrink-0" />
              : <Moon className="w-4 h-4 shrink-0" />
            }
            <span className={txt}>{resolvedTheme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
          </button>
        )}
        <form action={signout}>
          <button type="submit" className={ghostCls}>
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={txt}>로그아웃</span>
          </button>
        </form>
      </div>

      {/* Footer: account */}
      <div className="px-[10px] py-[10px] border-t border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {initial}
          </div>
          <span className={`text-[12px] font-medium text-[var(--text-primary)] truncate whitespace-nowrap transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            {displayName}
          </span>
        </div>
        <span className={`text-[11px] text-[var(--text-muted)] whitespace-nowrap block truncate mt-0.5 transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
          {userEmail}
        </span>
        <span className={`text-[11px] text-[var(--text-muted)] whitespace-nowrap block pt-1 transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
          © 2026 ForLabs Co.,Ltd.
        </span>
      </div>
    </aside>
  )
}