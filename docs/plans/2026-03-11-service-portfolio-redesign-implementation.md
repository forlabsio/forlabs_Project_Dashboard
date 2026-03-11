# Service Portfolio Manager — Taskhub 디자인 이식 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** forlabs-taskhub의 Plane.so 스타일 디자인 시스템을 service-portfolio-manager에 완전히 이식, 액센트 컬러만 초록(#16a34a)으로 변경

**Architecture:** shadcn/ui 완전 제거 → taskhub CSS 변수 시스템(`.plane-*` 클래스) 이식. 모달은 Radix Dialog 원시 컴포넌트 직접 사용, Select는 native `<select>` + plane-input 스타일.

**Tech Stack:** Next.js 15, Tailwind CSS 4, next-themes, radix-ui (Dialog, DropdownMenu), Geist font

**Worktree:** `/Users/peterchae/service-portfolio-manager/.worktrees/redesign-taskhub-theme/`

---

## Task 1: globals.css — 디자인 시스템 교체

**Files:**
- Modify: `src/app/globals.css`

**Step 1: 기존 OKLCH 시스템 전체를 taskhub CSS 변수 시스템으로 교체**

```css
/* src/app/globals.css — 전체 교체 */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

button, [role="button"], a, select, label[for], input[type="submit"], input[type="button"] {
  cursor: pointer;
}

:root {
  --surface-1: #ffffff;
  --surface-2: #f5f5f5;
  --surface-3: #ebebeb;
  --border-subtle: #e5e7eb;
  --border-strong: #d1d5db;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --accent: #16a34a;
  --accent-ring: rgba(22, 163, 74, 0.15);
}

.dark {
  --surface-1: #0d0f13;
  --surface-2: #141519;
  --surface-3: #1c1d22;
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-strong: rgba(255, 255, 255, 0.14);
  --text-primary: #e2e4e9;
  --text-secondary: #8b8f98;
  --text-muted: #5a5e6b;
  /* --accent 다크모드에서도 동일 */
}

@theme inline {
  --color-background: var(--surface-1);
  --color-foreground: var(--text-primary);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--surface-1);
  color: var(--text-primary);
}

/* === Plane-style Component Classes === */

.plane-card {
  background: var(--surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  transition: border-color 0.15s ease;
}
.plane-card:hover {
  border-color: var(--border-strong);
}

.plane-card-strong {
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
}

.plane-card-inner {
  background: var(--surface-3);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  transition: border-color 0.15s ease;
}
.plane-card-inner:hover {
  border-color: var(--border-strong);
}

.plane-input {
  background: var(--surface-3);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.plane-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-ring);
  outline: none;
}
.plane-input::placeholder {
  color: var(--text-muted);
}
.plane-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.plane-btn-primary {
  background: var(--accent);
  color: #ffffff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: opacity 0.15s ease, transform 0.1s ease;
}
.plane-btn-primary:hover:not(:disabled) { opacity: 0.88; }
.plane-btn-primary:active:not(:disabled) { transform: scale(0.98); }
.plane-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.plane-btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
}
.plane-btn-ghost:hover {
  background: var(--surface-3);
  color: var(--text-primary);
}

.plane-btn-outline {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: border-color 0.15s ease, color 0.15s ease;
}
.plane-btn-outline:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.plane-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

/* === Animations === */
@keyframes fadein {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadein { animation: fadein 0.15s ease-out; }
```

**Step 2: 빌드 확인**

```bash
cd /Users/peterchae/service-portfolio-manager/.worktrees/redesign-taskhub-theme
npm run build 2>&1 | tail -5
```
Expected: Build succeeds (오류 무시해도 됨 — 아직 shadcn 컴포넌트들이 이전 CSS 변수를 참조하므로 시각적으로 깨진 상태는 정상)

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: replace OKLCH design system with taskhub plane-style CSS variables (green accent)"
```

---

## Task 2: ThemeProvider 컴포넌트 추가

**Files:**
- Create: `src/components/ThemeProvider.tsx`

**Step 1: ThemeProvider 컴포넌트 생성**

```tsx
// src/components/ThemeProvider.tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Step 2: Root layout에 ThemeProvider 추가**

```tsx
// src/app/layout.tsx — 전체 교체
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forlabs Dashboard",
  description: "내 서비스 포트폴리오 관리",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/ThemeProvider.tsx src/app/layout.tsx
git commit -m "feat: add ThemeProvider for dark/light mode support"
```

---

## Task 3: Sidebar — 완전 재작성

**Files:**
- Modify: `src/components/nav/sidebar.tsx`

**Step 1: taskhub 패턴 기반으로 완전 재작성 (초록 액센트, service-portfolio nav 항목)**

```tsx
// src/components/nav/sidebar.tsx — 전체 교체
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, TrendingUp, BarChart3, LogOut, PanelLeftClose } from 'lucide-react'
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
      <div className="px-1.5 py-1.5 border-t border-[var(--border-subtle)] shrink-0">
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
```

**Step 2: Dashboard layout 업데이트**

```tsx
// src/app/(dashboard)/layout.tsx — 전체 교체
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/nav/sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-[var(--surface-1)] overflow-hidden">
      <Sidebar userEmail={user.email} />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
```

**Step 3: 빌드 확인**

```bash
cd /Users/peterchae/service-portfolio-manager/.worktrees/redesign-taskhub-theme
npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/components/nav/sidebar.tsx src/app/(dashboard)/layout.tsx
git commit -m "feat: rewrite sidebar with taskhub collapsible pattern + green accent"
```

---

## Task 4: 대시보드 컴포넌트 — StatsCard, RevenueChart, ServicesTable

**Files:**
- Modify: `src/components/dashboard/stats-card.tsx`
- Modify: `src/components/dashboard/revenue-chart.tsx`
- Modify: `src/components/dashboard/services-table.tsx`

**Step 1: StatsCard — shadcn Card → plane-card**

```tsx
// src/components/dashboard/stats-card.tsx — 전체 교체
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
```

**Step 2: RevenueChart — shadcn Card → plane-card**

`src/components/dashboard/revenue-chart.tsx` 파일에서 다음 두 가지만 변경:
- `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'` 줄 삭제
- 아래 JSX 교체:

```tsx
// 기존
return (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">월별 총 매출 (최근 6개월)</CardTitle>
    </CardHeader>
    <CardContent>
      ...chart...
    </CardContent>
  </Card>
)

// 변경 후
return (
  <div className="plane-card p-4">
    <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-4">월별 총 매출 (최근 6개월)</p>
    ...chart (그대로 유지)...
  </div>
)
```

Bar 색상도 초록으로 변경: `<Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />`

**Step 3: ServicesTable — shadcn Card → plane-card**

```tsx
// src/components/dashboard/services-table.tsx — 전체 교체
import Link from 'next/link'
import { Service, RevenueEntry } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: Pick<RevenueEntry, 'amount'>[] }

const statusColors: Record<string, string> = {
  active: 'bg-green-500/15 text-green-700 dark:text-green-400',
  paused: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  killed: 'bg-red-500/15 text-red-700 dark:text-red-400',
  test: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
}
const statusLabels: Record<string, string> = { active: '운영 중', paused: '일시정지', killed: '종료', test: '테스트' }

export function ServicesTable({ services }: { services: ServiceWithRevenue[] }) {
  const sorted = [...services]
    .map(s => ({
      ...s,
      total: s.revenue_entries.reduce((sum, e) => sum + Number(e.amount), 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return (
    <div className="plane-card p-4 h-full">
      <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">매출 Top 5 서비스</p>
      {sorted.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-4 text-[13px]">데이터 없음</p>
      ) : (
        <div className="space-y-1">
          {sorted.map((service, idx) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="flex items-center justify-between py-2 hover:bg-[var(--surface-3)] rounded-md px-2 -mx-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-[var(--text-muted)] w-4">{idx + 1}</span>
                <div>
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">{service.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full plane-badge ${statusColors[service.status] ?? ''}`}>
                    {statusLabels[service.status] ?? service.status}
                  </span>
                </div>
              </div>
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">₩{service.total.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 4: Dashboard page — text 스타일 업데이트**

`src/app/(dashboard)/page.tsx` 에서 `text-muted-foreground` → `text-[var(--text-muted)]` 로 교체:

```tsx
// 변경할 라인들 (2곳):
// 기존: <p className="text-muted-foreground mt-1">
// 변경: <p className="text-[12px] text-[var(--text-muted)] mt-1">
```

**Step 5: 빌드 확인**

```bash
npm run build 2>&1 | tail -10
```

**Step 6: Commit**

```bash
git add src/components/dashboard/ src/app/(dashboard)/page.tsx
git commit -m "style: migrate dashboard components to plane-card design system"
```

---

## Task 5: ServiceCard — 완전 교체

**Files:**
- Modify: `src/components/services/service-card.tsx`

**Step 1: ServiceCard 전체 교체 — shadcn Card/Badge/Button/DropdownMenu → plane + Radix primitives**

```tsx
// src/components/services/service-card.tsx — 전체 교체
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Service } from '@/types'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import { EditServiceDialog } from './edit-service-dialog'
import { ExternalLink, TrendingUp, MoreVertical, Pencil, Trash2 } from 'lucide-react'

const statusColors: Record<string, string> = {
  active: 'bg-green-500/15 text-green-700 dark:text-green-400',
  paused: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  killed: 'bg-red-500/15 text-red-700 dark:text-red-400',
  test: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
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
              <span className={`plane-badge text-[10px] ${statusColors[service.status] ?? ''}`}>
                {statusLabels[service.status]}
              </span>
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded-md plane-btn-ghost"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    className="plane-card z-50 p-1 min-w-[120px] shadow-lg"
                    align="end"
                    sideOffset={4}
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
                  <span className="plane-badge bg-[var(--accent)]/10 text-[var(--accent)] text-[10px]">유료</span>
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
```

**Step 2: ServicesFilter — 필터 버튼 plane 스타일로 교체**

```tsx
// src/components/services/services-filter.tsx — 전체 교체
'use client'

import { useState } from 'react'
import { ServiceCard } from './service-card'
import { Service, RevenueEntry } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: Pick<RevenueEntry, 'amount'>[] }

const filters = [
  { label: '전체', value: 'all' },
  { label: '운영 중', value: 'active' },
  { label: '테스트', value: 'test' },
  { label: '일시정지', value: 'paused' },
  { label: '종료', value: 'killed' },
]

export function ServicesFilter({ services }: { services: ServiceWithRevenue[] }) {
  const [active, setActive] = useState('all')

  const filtered = active === 'all' ? services : services.filter(s => s.status === active)

  return (
    <div>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
              active === f.value
                ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'plane-btn-ghost'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-[10px] opacity-60">
              {f.value === 'all' ? services.length : services.filter(s => s.status === f.value).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-[14px]">해당 상태의 서비스가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              totalRevenue={service.revenue_entries.reduce((sum, e) => sum + Number(e.amount), 0)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 3: 빌드 확인**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/components/services/service-card.tsx src/components/services/services-filter.tsx
git commit -m "style: migrate ServiceCard and ServicesFilter to plane design system"
```

---

## Task 6: 서비스 모달 — AddServiceDialog, EditServiceDialog 교체

**Files:**
- Modify: `src/components/services/add-service-dialog.tsx`
- Modify: `src/components/services/edit-service-dialog.tsx`

**Step 1: AddServiceDialog — Radix Dialog 원시 + plane- 스타일**

shadcn의 Dialog, Button, Input, Label, Select, Textarea를 모두 제거하고 Radix 원시 컴포넌트 + plane- 스타일로 대체. Select는 native `<select>` 사용.

```tsx
// src/components/services/add-service-dialog.tsx — 전체 교체
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Plus, X } from 'lucide-react'

export function AddServiceDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [noLaunchDate, setNoLaunchDate] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name'),
      description: formData.get('description') || null,
      url: formData.get('url') || null,
      category: formData.get('category') || null,
      status: formData.get('status'),
      launch_date: formData.get('launch_date') || null,
      is_paid: formData.get('is_paid') === 'true',
    }

    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (res.ok) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button className="plane-btn-primary flex items-center gap-1.5 px-3 py-2">
          <Plus className="w-4 h-4" />
          새 서비스 추가
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogPrimitive.Content className="plane-card-strong fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 w-full max-w-md shadow-xl animate-fadein">
          <div className="flex items-center justify-between mb-5">
            <DialogPrimitive.Title className="text-[14px] font-semibold text-[var(--text-primary)]">
              새 서비스 등록
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <button className="plane-btn-ghost w-7 h-7 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[12px] text-[var(--text-secondary)] mb-1">서비스 이름 *</label>
              <input name="name" required placeholder="My Awesome Service"
                className="plane-input w-full px-3 py-2" />
            </div>
            <div>
              <label className="block text-[12px] text-[var(--text-secondary)] mb-1">설명</label>
              <textarea name="description" placeholder="서비스 설명..." rows={3}
                className="plane-input w-full px-3 py-2 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-1">카테고리</label>
                <input name="category" placeholder="SaaS, API, 앱..."
                  className="plane-input w-full px-3 py-2" />
              </div>
              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-1">상태</label>
                <select name="status" defaultValue="active" className="plane-input w-full px-3 py-2">
                  <option value="active">운영 중</option>
                  <option value="paused">일시정지</option>
                  <option value="test">테스트</option>
                  <option value="killed">종료</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] text-[var(--text-secondary)] mb-1">서비스 URL</label>
              <input name="url" type="url" placeholder="https://..."
                className="plane-input w-full px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] text-[var(--text-secondary)]">런칭일</label>
                  <label className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] cursor-pointer">
                    <input type="checkbox" checked={noLaunchDate}
                      onChange={(e) => setNoLaunchDate(e.target.checked)}
                      className="w-3 h-3" />
                    미정
                  </label>
                </div>
                <input name="launch_date" type="date" disabled={noLaunchDate}
                  className="plane-input w-full px-3 py-2" />
              </div>
              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-1">유료 여부</label>
                <select name="is_paid" defaultValue="false" className="plane-input w-full px-3 py-2">
                  <option value="false">무료</option>
                  <option value="true">유료</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="plane-btn-primary w-full py-2 mt-1">
              {loading ? '추가 중...' : '서비스 추가'}
            </button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
```

**Step 2: EditServiceDialog — 동일한 패턴으로 교체**

```tsx
// src/components/services/edit-service-dialog.tsx — 전체 교체
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import { Service } from '@/types'

interface EditServiceDialogProps {
  service: Service
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditServiceDialog({ service, open, onOpenChange }: EditServiceDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [noLaunchDate, setNoLaunchDate] = useState(!service.launch_date)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name'),
      description: formData.get('description') || null,
      url: formData.get('url') || null,
      category: formData.get('category') || null,
      status: formData.get('status'),
      launch_date: formData.get('launch_date') || null,
      is_paid: formData.get('is_paid') === 'true',
    }

    const res = await fetch(`/api/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (res.ok) {
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogPrimitive.Content className="plane-card-strong fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 w-full max-w-md shadow-xl animate-fadein">
          <div className="flex items-center justify-between mb-5">
            <DialogPrimitive.Title className="text-[14px] font-semibold text-[var(--text-primary)]">
              서비스 수정
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <button className="plane-btn-ghost w-7 h-7 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[12px] text-[var(--text-secondary)] mb-1">서비스 이름 *</label>
              <input name="name" required defaultValue={service.name}
                className="plane-input w-full px-3 py-2" />
            </div>
            <div>
              <label className="block text-[12px] text-[var(--text-secondary)] mb-1">설명</label>
              <textarea name="description" rows={3} defaultValue={service.description ?? ''}
                className="plane-input w-full px-3 py-2 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-1">카테고리</label>
                <input name="category" defaultValue={service.category ?? ''}
                  className="plane-input w-full px-3 py-2" />
              </div>
              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-1">상태</label>
                <select name="status" defaultValue={service.status} className="plane-input w-full px-3 py-2">
                  <option value="active">운영 중</option>
                  <option value="paused">일시정지</option>
                  <option value="test">테스트</option>
                  <option value="killed">종료</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] text-[var(--text-secondary)] mb-1">서비스 URL</label>
              <input name="url" type="url" placeholder="https://..." defaultValue={service.url ?? ''}
                className="plane-input w-full px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] text-[var(--text-secondary)]">런칭일</label>
                  <label className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] cursor-pointer">
                    <input type="checkbox" checked={noLaunchDate}
                      onChange={(e) => setNoLaunchDate(e.target.checked)}
                      className="w-3 h-3" />
                    미정
                  </label>
                </div>
                <input name="launch_date" type="date" defaultValue={service.launch_date ?? ''}
                  disabled={noLaunchDate} className="plane-input w-full px-3 py-2" />
              </div>
              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-1">유료 여부</label>
                <select name="is_paid" defaultValue={service.is_paid ? 'true' : 'false'}
                  className="plane-input w-full px-3 py-2">
                  <option value="false">무료</option>
                  <option value="true">유료</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="plane-btn-primary w-full py-2 mt-1">
              {loading ? '저장 중...' : '저장'}
            </button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
```

**Step 3: 빌드 확인**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/components/services/add-service-dialog.tsx src/components/services/edit-service-dialog.tsx
git commit -m "style: migrate service dialogs to Radix primitives + plane design system"
```

---

## Task 7: RevenueForm + Services/[id] 페이지 교체

**Files:**
- Modify: `src/components/services/revenue-form.tsx`
- Modify: `src/app/(dashboard)/services/[id]/page.tsx`

**Step 1: RevenueForm — Card → plane-card, 입력 → plane-input**

```tsx
// src/components/services/revenue-form.tsx — 전체 교체
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RevenueForm({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const body = {
      service_id: serviceId,
      amount: Number(formData.get('amount')),
      currency: 'KRW',
      entry_date: formData.get('entry_date'),
      note: formData.get('note') || null,
      revenue_type: formData.get('revenue_type'),
    }

    const res = await fetch('/api/revenue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (res.ok) {
      (e.target as HTMLFormElement).reset()
      router.refresh()
    }
  }

  return (
    <div className="plane-card p-4">
      <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">매출 추가</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[12px] text-[var(--text-secondary)] mb-1">금액 (KRW)</label>
            <input name="amount" type="number" min="0" step="100" required placeholder="50000"
              className="plane-input w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-[12px] text-[var(--text-secondary)] mb-1">날짜</label>
            <input name="entry_date" type="date" required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="plane-input w-full px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] text-[var(--text-secondary)] mb-1">유형</label>
          <select name="revenue_type" defaultValue="one-time" className="plane-input w-full px-3 py-2">
            <option value="one-time">일회성</option>
            <option value="subscription">구독</option>
            <option value="ads">광고</option>
            <option value="other">기타</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] text-[var(--text-secondary)] mb-1">메모</label>
          <textarea name="note" placeholder="결제 메모..." rows={2}
            className="plane-input w-full px-3 py-2 resize-none" />
        </div>
        <button type="submit" disabled={loading}
          className="plane-btn-primary w-full py-2">
          {loading ? '추가 중...' : '매출 기록 추가'}
        </button>
      </form>
    </div>
  )
}
```

**Step 2: Services/[id] page — Card/Badge/Button → plane 스타일**

```tsx
// src/app/(dashboard)/services/[id]/page.tsx — 전체 교체
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RevenueForm } from '@/components/services/revenue-form'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { RevenueEntry, Service } from '@/types'

const statusLabels: Record<string, string> = { active: '운영 중', paused: '일시정지', killed: '종료', test: '테스트' }
const statusColors: Record<string, string> = {
  active: 'bg-green-500/15 text-green-700 dark:text-green-400',
  paused: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  killed: 'bg-red-500/15 text-red-700 dark:text-red-400',
  test: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
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
      {/* 뒤로가기 + 헤더 */}
      <div className="mb-6">
        <Link href="/services" className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          서비스 목록
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[20px] font-bold text-[var(--text-primary)]">{service.name}</h1>
              <span className={`plane-badge ${statusColors[service.status] ?? ''}`}>
                {statusLabels[service.status] ?? service.status}
              </span>
            </div>
            {service.description && (
              <p className="text-[13px] text-[var(--text-muted)] mt-1">{service.description}</p>
            )}
          </div>
          {service.url && (
            <a href={service.url} target="_blank" rel="noopener noreferrer"
              className="plane-btn-outline flex items-center gap-2 px-3 py-2">
              <ExternalLink className="h-4 w-4" />
              방문하기
            </a>
          )}
        </div>
      </div>

      {/* 통계 카드 3개 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="plane-card-inner p-4">
          <p className="text-[22px] font-bold text-[var(--text-primary)]">₩{totalRevenue.toLocaleString()}</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">총 매출</p>
        </div>
        <div className="plane-card-inner p-4">
          <p className="text-[22px] font-bold text-[var(--text-primary)]">₩{monthlyRevenue.toLocaleString()}</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">최근 30일 매출</p>
        </div>
        <div className="plane-card-inner p-4">
          <p className="text-[22px] font-bold text-[var(--text-primary)]">{revenues.length}건</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">총 거래 수</p>
        </div>
      </div>

      {/* 매출 기록 + 추가 폼 */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="plane-card p-4">
            <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">매출 기록</p>
            {revenues.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-8 text-[13px]">아직 매출 기록이 없습니다</p>
            ) : (
              <div className="space-y-1">
                {revenues
                  .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                      <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">₩{Number(entry.amount).toLocaleString()}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {new Date(entry.entry_date).toLocaleDateString('ko-KR')} · {revenueTypeLabels[entry.revenue_type] ?? entry.revenue_type}
                        </p>
                        {entry.note && <p className="text-[11px] text-[var(--text-muted)]">{entry.note}</p>}
                      </div>
                      <span className={`plane-badge bg-[var(--surface-3)] text-[var(--text-muted)]`}>
                        {revenueTypeLabels[entry.revenue_type] ?? entry.revenue_type}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <RevenueForm serviceId={id} />
        </div>
      </div>
    </div>
  )
}
```

**Step 3: 빌드 확인**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/components/services/revenue-form.tsx src/app/(dashboard)/services/
git commit -m "style: migrate revenue form and service detail page to plane design system"
```

---

## Task 8: Revenue 페이지 교체

**Files:**
- Modify: `src/app/(dashboard)/revenue/page.tsx`

**Step 1: Card → plane-card, muted-foreground → CSS 변수**

```tsx
// src/app/(dashboard)/revenue/page.tsx — 전체 교체
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { RevenueEntry, Service } from '@/types'

const revenueTypeLabels: Record<string, string> = {
  'one-time': '일회성', subscription: '구독', ads: '광고', other: '기타'
}
const revenueTypeBadge: Record<string, string> = {
  'one-time': 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  subscription: 'bg-green-500/15 text-green-700 dark:text-green-400',
  ads: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  other: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
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
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-[var(--text-primary)]">매출 관리</h1>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">총 누적 매출: ₩{totalRevenue.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {(['subscription', 'one-time', 'ads', 'other'] as const).map(type => (
          <div key={type} className="plane-card p-4">
            <p className="text-[11px] text-[var(--text-muted)]">{revenueTypeLabels[type]}</p>
            <p className="text-[20px] font-bold text-[var(--text-primary)] mt-0.5">₩{(byType[type] ?? 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="plane-card p-4">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">전체 매출 기록 (최근 100건)</p>
        {entries.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-8 text-[13px]">아직 매출 기록이 없습니다</p>
        ) : (
          <div>
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)] last:border-0">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">₩{Number(entry.amount).toLocaleString()}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {new Date(entry.entry_date).toLocaleDateString('ko-KR')}
                      {entry.note && ` · ${entry.note}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {entry.services && (
                    <Link href={`/services/${entry.services.id}`}
                      className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      {entry.services.name}
                    </Link>
                  )}
                  <span className={`plane-badge ${revenueTypeBadge[entry.revenue_type] ?? ''}`}>
                    {revenueTypeLabels[entry.revenue_type] ?? entry.revenue_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: 빌드 확인**

```bash
npm run build 2>&1 | tail -10
```

**Step 3: Commit**

```bash
git add src/app/(dashboard)/revenue/page.tsx
git commit -m "style: migrate revenue page to plane design system"
```

---

## Task 9: Analytics 페이지 교체

**Files:**
- Modify: `src/app/(dashboard)/analytics/page.tsx`

**Step 1: Card → plane-card, 모든 Tailwind 색상 → CSS 변수**

```tsx
// src/app/(dashboard)/analytics/page.tsx — 전체 교체
import { createClient } from '@/lib/supabase/server'
import { ServiceRevenueChart } from '@/components/analytics/service-revenue-chart'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { Service, RevenueEntry } from '@/types'

type ServiceWithRevenue = Service & { revenue_entries: RevenueEntry[] }

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const [servicesResult, allRevenueResult] = await Promise.all([
    supabase.from('services').select('*, revenue_entries(*)'),
    supabase.from('revenue_entries').select('*'),
  ])

  const services = (servicesResult.data || []) as ServiceWithRevenue[]
  const revenues = (allRevenueResult.data || []) as RevenueEntry[]

  const serviceRevenue = services.map(s => ({
    name: s.name,
    value: s.revenue_entries.reduce((sum, e) => sum + Number(e.amount), 0),
  }))

  const statusCounts = {
    active: services.filter(s => s.status === 'active').length,
    paused: services.filter(s => s.status === 'paused').length,
    test: services.filter(s => s.status === 'test').length,
    killed: services.filter(s => s.status === 'killed').length,
  }

  const launchedServices = services.filter(s => s.launch_date)
  const oldestLaunch = launchedServices.sort(
    (a, b) => new Date(a.launch_date!).getTime() - new Date(b.launch_date!).getTime()
  )[0]
  const weeksSinceFirst = oldestLaunch
    ? Math.max(1, Math.round((Date.now() - new Date(oldestLaunch.launch_date!).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : 1
  const launchPace = (services.length / weeksSinceFirst).toFixed(1)

  const maxRevenue = Math.max(...serviceRevenue.map(s => s.value), 1)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-[var(--text-primary)]">분석</h1>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">서비스 포트폴리오 인사이트</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {[
          { count: statusCounts.active, label: '운영 중', color: 'text-[var(--accent)]' },
          { count: statusCounts.paused, label: '일시정지', color: 'text-[var(--text-muted)]' },
          { count: statusCounts.test, label: '테스트', color: 'text-blue-500' },
          { count: statusCounts.killed, label: '종료', color: 'text-red-500' },
          { count: null, label: '런칭 페이스', value: `${launchPace}개/주`, color: 'text-[var(--text-primary)]' },
        ].map(({ count, label, value, color }) => (
          <div key={label} className="plane-card p-4">
            <p className={`text-[22px] font-bold ${color}`}>{value ?? count}</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <RevenueChart entries={revenues} />
        <ServiceRevenueChart data={serviceRevenue} />
      </div>

      <div className="plane-card p-4">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">서비스별 매출 상세</p>
        {serviceRevenue.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-4 text-[13px]">데이터 없음</p>
        ) : (
          <div className="space-y-2">
            {serviceRevenue
              .sort((a, b) => b.value - a.value)
              .map((item, idx) => {
                const percentage = Math.round((item.value / maxRevenue) * 100)
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <p className="text-[13px] text-[var(--text-primary)] w-40 truncate">{item.name}</p>
                    <div className="flex-1 bg-[var(--surface-3)] rounded-full h-2">
                      <div
                        className="bg-[var(--accent)] h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)] w-28 text-right">₩{item.value.toLocaleString()}</p>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: ServiceRevenueChart — plane-card 적용**

`src/components/analytics/service-revenue-chart.tsx` 파일에서:
- `import { Card, CardContent, CardHeader, CardTitle }` 줄 삭제
- `Card/CardHeader/CardTitle/CardContent` → `div.plane-card` 구조로 변경

**Step 3: 빌드 확인**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/app/(dashboard)/analytics/page.tsx src/components/analytics/
git commit -m "style: migrate analytics page to plane design system"
```

---

## Task 10: 로그인 & 회원가입 페이지 교체

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/signup/page.tsx`

**Step 1: Login page — 배경 + Card → plane-card**

```tsx
// src/app/login/page.tsx — 전체 교체
import Link from 'next/link'
import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-1)]">
      <div className="plane-card-strong w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)]">Forlabs Dashboard</h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">내 서비스들을 한 눈에</p>
        </div>

        {error && <p className="text-red-500 text-[12px] mb-4 text-center">{error}</p>}
        {message && <p className="text-[var(--accent)] text-[12px] mb-4 text-center">{message}</p>}

        <form className="space-y-3">
          <div>
            <label className="block text-[12px] text-[var(--text-secondary)] mb-1">이메일</label>
            <input id="email" name="email" type="email" required placeholder="you@example.com"
              className="plane-input w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-[12px] text-[var(--text-secondary)] mb-1">비밀번호</label>
            <input id="password" name="password" type="password" required placeholder="••••••••"
              className="plane-input w-full px-3 py-2" />
          </div>
          <button formAction={login} className="plane-btn-primary w-full py-2 mt-1">로그인</button>
        </form>

        <p className="text-center text-[12px] text-[var(--text-muted)] mt-5">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-[var(--accent)] font-medium hover:opacity-80">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
```

**Step 2: Signup page — 동일 패턴**

```tsx
// src/app/signup/page.tsx — 전체 교체
import Link from 'next/link'
import { signup } from './actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-1)]">
      <div className="plane-card-strong w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)]">회원가입</h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">Portfolio Manager 계정 만들기</p>
        </div>

        {error && <p className="text-red-500 text-[12px] mb-4 text-center">{error}</p>}

        <form className="space-y-3">
          <div>
            <label className="block text-[12px] text-[var(--text-secondary)] mb-1">이메일</label>
            <input id="email" name="email" type="email" required placeholder="you@example.com"
              className="plane-input w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-[12px] text-[var(--text-secondary)] mb-1">비밀번호</label>
            <input id="password" name="password" type="password" required placeholder="6자 이상"
              className="plane-input w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-[12px] text-[var(--text-secondary)] mb-1">비밀번호 확인</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required placeholder="비밀번호 재입력"
              className="plane-input w-full px-3 py-2" />
          </div>
          <button formAction={signup} className="plane-btn-primary w-full py-2 mt-1">가입하기</button>
        </form>

        <p className="text-center text-[12px] text-[var(--text-muted)] mt-5">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-[var(--accent)] font-medium hover:opacity-80">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
```

**Step 3: 빌드 확인**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/app/login/page.tsx src/app/signup/page.tsx
git commit -m "style: migrate login and signup pages to plane design system"
```

---

## Task 11: Services page 헤더 텍스트 업데이트

**Files:**
- Modify: `src/app/(dashboard)/services/page.tsx`

**Step 1: muted-foreground 제거**

```tsx
// src/app/(dashboard)/services/page.tsx 에서 변경:
// 기존: <h1 className="text-2xl font-bold">서비스 목록</h1>
// 변경:
<h1 className="text-[20px] font-bold text-[var(--text-primary)]">서비스</h1>

// 기존: <p className="text-lg">아직 등록된 서비스가 없습니다</p>
// 변경:
<p className="text-[14px] text-[var(--text-muted)]">아직 등록된 서비스가 없습니다</p>
<p className="text-[12px] text-[var(--text-muted)] mt-2">첫 번째 서비스를 추가해보세요!</p>
```

**Step 2: Commit**

```bash
git add src/app/(dashboard)/services/page.tsx
git commit -m "style: update services page header text styles"
```

---

## Task 12: shadcn 파일 정리

**Files:**
- Delete: `src/components/ui/` (전체 폴더)
- Delete: `components.json`
- Modify: `package.json` (`class-variance-authority` 제거)

**Step 1: shadcn UI 컴포넌트 폴더 삭제**

```bash
rm -rf src/components/ui/
rm -f components.json
```

**Step 2: package.json에서 class-variance-authority 제거**

`package.json`에서 `"class-variance-authority": "^0.7.1"` 줄을 삭제

**Step 3: 빌드 확인 (이 시점에서 shadcn import가 남아있으면 오류 발생)**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 4: 오류가 있으면 해당 파일 수정, 없으면 바로 commit**

Expected: 빌드 성공. 만약 오류 있으면 해당 파일에서 남아있는 `@/components/ui/` import를 찾아 제거.

```bash
# 혹시 남아있는 shadcn import 검색
grep -r "from '@/components/ui" src/ 2>/dev/null
```

**Step 5: Commit**

```bash
npm install  # package-lock.json 업데이트
git add -A
git commit -m "chore: remove shadcn/ui components and class-variance-authority dependency"
```

---

## Task 13: 최종 빌드 검증 + PR 준비

**Step 1: 전체 빌드**

```bash
cd /Users/peterchae/service-portfolio-manager/.worktrees/redesign-taskhub-theme
npm run build 2>&1
```

Expected: ✓ Build succeeded, no TypeScript errors

**Step 2: 타입 검사**

```bash
npx tsc --noEmit 2>&1
```

Expected: 오류 없음

**Step 3: 최종 commit**

```bash
git add -A
git status  # 남아있는 변경사항 확인
```

**Step 4: PR 준비**

```bash
git log --oneline main..HEAD
```

결과를 user에게 보여주고 main 브랜치에 merge할지 확인.