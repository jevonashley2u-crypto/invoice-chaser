import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addWeeks, addMonths, addYears, isBefore, isToday, startOfDay } from 'date-fns'

export async function GET(request: Request) {
  // 1. Verify Vercel Cron Secret
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role key to bypass RLS in the cron job
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 2. Fetch active recurring invoices
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('is_recurring', true)
    .neq('status', 'paid') // Usually we only recur active invoice setups, or maybe we recur ANY invoice marked as recurring. Let's recur all of them that are templates.

  if (error) {
    console.error('Error fetching recurring invoices:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const today = startOfDay(new Date())
  let processedCount = 0

  for (const inv of invoices || []) {
    if (inv.recurring_interval === 'none' || !inv.recurring_interval) continue

    const baseDate = inv.last_recurring_date ? new Date(inv.last_recurring_date) : new Date(inv.issue_date)
    let nextIssueDate = baseDate

    switch (inv.recurring_interval) {
      case 'weekly':
        nextIssueDate = addWeeks(baseDate, 1)
        break
      case 'monthly':
        nextIssueDate = addMonths(baseDate, 1)
        break
      case 'quarterly':
        nextIssueDate = addMonths(baseDate, 3)
        break
      case 'yearly':
        nextIssueDate = addYears(baseDate, 1)
        break
    }

    // If the next issue date is today or in the past, generate a new invoice
    if (isBefore(nextIssueDate, today) || isToday(nextIssueDate)) {
      
      // Calculate new due date based on the original invoice terms (e.g. 30 days)
      const originalIssueDate = new Date(inv.issue_date)
      const originalDueDate = new Date(inv.due_date)
      const termDays = Math.round((originalDueDate.getTime() - originalIssueDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const newIssueDate = new Date()
      const newDueDate = new Date(newIssueDate.getTime() + (termDays * 24 * 60 * 60 * 1000))

      // 3. Create the new invoice clone
      const { data: newInv, error: insertError } = await supabase
        .from('invoices')
        .insert({
          client_id: inv.client_id,
          business_id: inv.business_id,
          invoice_number: `${inv.invoice_number}-REC-${Date.now().toString().slice(-4)}`,
          issue_date: newIssueDate.toISOString().split('T')[0],
          due_date: newDueDate.toISOString().split('T')[0],
          status: 'draft',
          subtotal: inv.subtotal,
          tax: inv.tax,
          discount: inv.discount,
          total: inv.total,
          items: inv.items,
          notes: inv.notes,
          is_recurring: false, // The clone is NOT recurring, only the parent template is
          recurring_interval: 'none'
        })

      if (insertError) {
        console.error(`Failed to generate recurring invoice for ${inv.id}:`, insertError)
        continue
      }

      // 4. Update the parent template's last_recurring_date
      await supabase
        .from('invoices')
        .update({ last_recurring_date: newIssueDate.toISOString().split('T')[0] })
        .eq('id', inv.id)

      processedCount++
    }
  }

  return NextResponse.json({ success: true, processed: processedCount })
}
