import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToStream } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/pdf/invoice-template'
import { Resend } from 'resend'

// Make sure to add RESEND_API_KEY to your .env
const resend = new Resend(process.env.RESEND_API_KEY || 're_123')

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get Invoice details
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, businesses(*), clients(*), invoice_items(*)')
      .eq('id', id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (!invoice.clients.email) {
      return NextResponse.json({ error: 'Client has no email address' }, { status: 400 })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const paymentUrl = `${origin}/pay/${invoice.id}`

    // 1. Generate PDF Attachment
    const stream = await renderToStream(<InvoicePDF invoice={invoice} paymentUrl={paymentUrl} />)
    const pdfBuffer = await streamToBuffer(stream as any)

    // 2. Send Email via Resend
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Skipping actual email dispatch.")
      // Update status to sent anyway for demo purposes if no API key
      await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoice.id)
      // Redirect back with a note
      return NextResponse.redirect(`${origin}/invoices/${invoice.id}?sent=demo`, { status: 302 })
    }

    const { data, error } = await resend.emails.send({
      from: `${invoice.businesses.name} <billing@yourdomain.com>`, // Replace with your verified Resend domain
      to: [invoice.clients.email],
      subject: `Invoice ${invoice.invoice_number} from ${invoice.businesses.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${invoice.clients.name},</h2>
          <p>Please find attached invoice <strong>${invoice.invoice_number}</strong> for the amount of <strong>$${invoice.total}</strong>.</p>
          <p>The due date is <strong>${new Date(invoice.due_date).toLocaleDateString()}</strong>.</p>
          ${invoice.status !== 'paid' ? `
            <div style="margin: 30px 0;">
              <a href="${paymentUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Pay Invoice Securely
              </a>
            </div>
          ` : '<p>This invoice has already been paid. Thank you!</p>'}
          <p>If you have any questions, please let us know.</p>
          <p>Thank you,<br/>${invoice.businesses.name}</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    if (error) {
      throw error
    }

    // 3. Update invoice status to 'sent'
    if (invoice.status === 'draft') {
      await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoice.id)
    }

    return NextResponse.redirect(`${origin}/invoices/${invoice.id}?sent=true`, { status: 302 })

  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
