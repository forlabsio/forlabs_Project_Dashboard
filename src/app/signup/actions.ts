'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    redirect('/signup?error=' + encodeURIComponent('비밀번호가 일치하지 않습니다.'))
  }

  if (password.length < 6) {
    redirect('/signup?error=' + encodeURIComponent('비밀번호는 6자 이상이어야 합니다.'))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) redirect('/signup?error=' + encodeURIComponent(error.message))

  revalidatePath('/', 'layout')
  redirect('/?message=' + encodeURIComponent('회원가입이 완료되었습니다. 이메일을 확인해주세요.'))
}
