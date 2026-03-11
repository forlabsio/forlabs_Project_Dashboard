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