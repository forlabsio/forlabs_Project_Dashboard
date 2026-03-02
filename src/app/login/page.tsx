import { login, signup } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Portfolio Manager</CardTitle>
          <p className="text-center text-muted-foreground text-sm">내 서비스들을 한 눈에</p>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button formAction={login} className="flex-1">로그인</Button>
              <Button formAction={signup} variant="outline" className="flex-1">회원가입</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
