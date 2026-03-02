'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">매출 추가</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">금액 (KRW)</Label>
              <Input id="amount" name="amount" type="number" min="0" step="100" required placeholder="50000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="entry_date">날짜</Label>
              <Input
                id="entry_date"
                name="entry_date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="revenue_type">유형</Label>
            <Select name="revenue_type" defaultValue="one-time">
              <SelectTrigger id="revenue_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">일회성</SelectItem>
                <SelectItem value="subscription">구독</SelectItem>
                <SelectItem value="ads">광고</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">메모</Label>
            <Textarea id="note" name="note" placeholder="결제 메모..." rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '추가 중...' : '매출 기록 추가'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
