import Link from 'next/link'
import { signup } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">회원가입</CardTitle>
          <p className="text-center text-muted-foreground text-sm">Portfolio Manager 계정 만들기</p>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" required placeholder="6자 이상" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="비밀번호 재입력" />
            </div>
            <Button formAction={signup} className="w-full">가입하기</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
