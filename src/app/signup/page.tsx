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
