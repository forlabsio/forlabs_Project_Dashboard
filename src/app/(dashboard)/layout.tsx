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