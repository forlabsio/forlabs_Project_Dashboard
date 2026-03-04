'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Service } from '@/types'

interface EditServiceDialogProps {
  service: Service
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditServiceDialog({ service, open, onOpenChange }: EditServiceDialogProps) {
  const router = useRouter()
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>서비스 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">서비스 이름 *</Label>
            <Input id="edit-name" name="name" required defaultValue={service.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">설명</Label>
            <Textarea id="edit-description" name="description" rows={3} defaultValue={service.description ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">카테고리</Label>
              <Input id="edit-category" name="category" defaultValue={service.category ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">상태</Label>
              <Select name="status" defaultValue={service.status}>
                <SelectTrigger id="edit-status">
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
            <Label htmlFor="edit-url">서비스 URL</Label>
            <Input id="edit-url" name="url" type="url" placeholder="https://..." defaultValue={service.url ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-launch_date">런칭일</Label>
              <Input id="edit-launch_date" name="launch_date" type="date" defaultValue={service.launch_date ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-is_paid">유료 여부</Label>
              <Select name="is_paid" defaultValue={service.is_paid ? 'true' : 'false'}>
                <SelectTrigger id="edit-is_paid">
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
            {loading ? '저장 중...' : '저장'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
