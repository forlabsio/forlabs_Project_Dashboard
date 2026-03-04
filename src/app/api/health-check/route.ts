import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ status: 'down', code: null }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
      redirect: 'follow',
    })
    const up = response.status >= 200 && response.status < 400
    return NextResponse.json({ status: up ? 'up' : 'down', code: response.status })
  } catch {
    return NextResponse.json({ status: 'down', code: null })
  }
}
