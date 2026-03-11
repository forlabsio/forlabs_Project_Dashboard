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
