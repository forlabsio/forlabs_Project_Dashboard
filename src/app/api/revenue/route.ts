import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get('service_id')

  // Filter by user's services only
  const { data: userServices } = await supabase
    .from('services').select('id').eq('user_id', user.id)
  const serviceIds = (userServices || []).map((s: { id: string }) => s.id)

  let query = supabase
    .from('revenue_entries')
    .select('*, services(name)')
    .in('service_id', serviceIds.length > 0 ? serviceIds : ['none'])
    .order('entry_date', { ascending: false })

  if (serviceId) query = query.eq('service_id', serviceId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Verify service belongs to user
  const { data: service } = await supabase
    .from('services').select('id').eq('id', body.service_id).eq('user_id', user.id).single()
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const amount = Number(body.amount)
  if (isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('revenue_entries')
    .insert({ ...body, amount })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
