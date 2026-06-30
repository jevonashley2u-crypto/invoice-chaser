import { createClient } from './supabase/server'
import { startOfMonth, endOfMonth } from 'date-fns'

export const TIER_LIMITS = {
  starter: { invoices: 50, clients: 20 },
  pro: { invoices: 500, clients: 200 },
  business: { invoices: Infinity, clients: Infinity }
}

export async function checkUsageLimit(businessId: string, type: 'invoices' | 'clients'): Promise<{ allowed: boolean, limit: number, current: number }> {
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('tier')
    .eq('id', businessId)
    .single()

  const tier = (business?.tier || 'starter') as keyof typeof TIER_LIMITS
  const limit = TIER_LIMITS[tier][type]

  if (limit === Infinity) {
    return { allowed: true, limit, current: 0 }
  }

  let current = 0

  if (type === 'invoices') {
    // Invoices are usually counted per month
    const start = startOfMonth(new Date()).toISOString()
    const end = endOfMonth(new Date()).toISOString()

    const { count } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', start)
      .lte('created_at', end)
    
    current = count || 0
  } else if (type === 'clients') {
    // Clients are usually a total hard cap
    const { count } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
    
    current = count || 0
  }

  return {
    allowed: current < limit,
    limit,
    current
  }
}
