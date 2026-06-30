import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { differenceInDays, startOfDay } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY || 're_123')

export async function GET(request: Request) {
  // 1. Verify Vercel Cron Secret
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 2. Fetch unpaid invoices that are sent (meaning they are actively awaiting payment)
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients ( name, email ),
      businesses ( name )
    `)
    .eq('status', 'sent')

  if (error) {
    console.error('Error fetching unpaid invoices:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const today = startOfDay(new Date())
  let emailsSent = 0

  for (const inv of invoices || []) {
    if (!inv.clients?.email) continue

    const dueDate = startOfDay(new Date(inv.due_date))
    const daysUntilDue = differenceInDays(dueDate, today)
    const daysOverdue = differenceInDays(today, dueDate)

    let emailSubject = ''
    let emailBody = ''
    let updateColumn = ''

    // (a) 3 days before due date
    if (daysUntilDue === 3 && !inv.reminder_due_soon_sent) {
      emailSubject = `Payment Due Soon: Invoice ${inv.invoice_number}`
      emailBody = `Hi ${inv.clients.name}, this is a friendly reminder that Invoice ${inv.invoice_number} for $${inv.total} is due in 3 days on ${inv.due_date}.`
      updateColumn = 'reminder_due_soon_sent'
    } 
    // (b) On due date
    else if (daysUntilDue === 0 && !inv.reminder_due_today_sent) {
      emailSubject = `Payment Due Today: Invoice ${inv.invoice_number}`
      emailBody = `Hi ${inv.clients.name}, please note that Invoice ${inv.invoice_number} for $${inv.total} is due today.`
      updateColumn = 'reminder_due_today_sent'
    } 
    // (c) 7 days after due date
    else if (daysOverdue === 7 && !inv.reminder_overdue_sent) {
      emailSubject = `Overdue Payment: Invoice ${inv.invoice_number}`
      emailBody = `Hi ${inv.clients.name}, Invoice ${inv.invoice_number} for $${inv.total} is now 7 days overdue. Please process payment as soon as possible.`
      updateColumn = 'reminder_overdue_sent'
    }

    if (updateColumn && emailSubject) {
      try {
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'billing@invoiceos.com', // Replace with verified domain
            to: inv.clients.email,
            subject: emailSubject,
            text: emailBody,
          })
        } else {
          console.log(`[SIMULATED EMAIL] To: ${inv.clients.email} | Subject: ${emailSubject}`)
        }

        // Mark as sent
        await supabase
          .from('invoices')
          .update({ [updateColumn]: true })
          .eq('id', inv.id)

        emailsSent++
      } catch (err) {
        console.error(`Failed to send reminder for invoice ${inv.id}:`, err)
      }
    }
  }

  return NextResponse.json({ success: true, emailsSent })
}
