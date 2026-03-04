'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Package, TrendingUp, BarChart3, LogOut, User } from 'lucide-react'
import { signout } from '@/app/login/actions'

const navItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/services', label: '서비스 목록', icon: Package },
  { href: '/revenue', label: '매출 관리', icon: TrendingUp },
  { href: '/analytics', label: '분석', icon: BarChart3 },
]

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="font-bold text-lg">Business Console</h1>
        <p className="text-xs text-muted-foreground mt-1">내 서비스 관리 허브</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t space-y-1">
        {userEmail && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate">{userEmail}</span>
          </div>
        )}
        <form action={signout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-gray-100 w-full"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  )
}
