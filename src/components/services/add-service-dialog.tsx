'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

export function AddServiceDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          새 서비스 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>새 서비스 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">서비스 이름 *</Label>
            <Input id="name" name="name" required placeholder="My Awesome Service" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea id="description" name="description" placeholder="서비스 설명..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Input id="category" name="category" placeholder="SaaS, API, 앱..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">운영 중</SelectItem>
                  <SelectItem value="paused">일시정지</SelectItem>
                  <SelectItem value="killed">종료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">서비스 URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="launch_date">런칭일</Label>
              <Input id="launch_date" name="launch_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_paid">유료 여부</Label>
              <Select name="is_paid" defaultValue="false">
                <SelectTrigger id="is_paid">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">무료</SelectItem>
                  <SelectItem value="true">유료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '추가 중...' : '서비스 추가'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
