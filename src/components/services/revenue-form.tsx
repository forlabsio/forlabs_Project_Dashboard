'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RevenueForm({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    setError(null)
    const formData = new FormData(form)
    const amount = Number(formData.get('amount'))
    if (isNaN(amount) || amount <= 0) {
      setError('올바른 금액을 입력해주세요.')
      setLoading(false)
      return
    }
    const body = {
      service_id: serviceId,
      amount,
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
      form.reset()
      router.refresh()
    } else {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? '매출 추가에 실패했습니다.')
    }
  }

  return (
    <div className="plane-card p-4">
      <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">매출 추가</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[12px] text-[var(--text-secondary)] mb-1">금액 (KRW)</label>
            <input name="amount" type="number" min="1" step="100" required placeholder="50000"
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
        {error && <p className="text-[12px] text-[var(--rose)]">{error}</p>}
        <button type="submit" disabled={loading}
          className="plane-btn-primary w-full py-2">
          {loading ? '추가 중...' : '매출 기록 추가'}
        </button>
      </form>
    </div>
  )
}
