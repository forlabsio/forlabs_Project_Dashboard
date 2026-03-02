export type ServiceStatus = 'active' | 'paused' | 'killed'
export type RevenueType = 'subscription' | 'one-time' | 'ads' | 'other'

export interface Service {
  id: string
  user_id: string
  name: string
  description: string | null
  url: string | null
  status: ServiceStatus
  category: string | null
  launch_date: string | null
  is_paid: boolean
  pricing_model: string | null
  tags: string[] | null
  created_at: string
}

export interface RevenueEntry {
  id: string
  service_id: string
  amount: number
  currency: string
  entry_date: string
  note: string | null
  revenue_type: RevenueType
  created_at: string
}

export interface ServiceMetric {
  id: string
  service_id: string
  metric_date: string
  metric_name: string
  metric_value: number
  created_at: string
}

export interface ServiceWithRevenue extends Service {
  total_revenue: number
  revenue_entries: RevenueEntry[]
}

export interface DashboardStats {
  total_services: number
  active_services: number
  total_revenue: number
  monthly_revenue: number
  top_service: ServiceWithRevenue | null
}
