import { createClient } from '@/lib/supabase/server'
import { google } from '@ai-sdk/google'
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const supabase = await createClient()

    // Enforce authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Determine Provider
    const provider = process.env.OPENROUTER_API_KEY ? 'openrouter' : (process.env.AI_PROVIDER || 'gemini')
    let model

    if (provider === 'openrouter') {
      const openrouter = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      })
      model = openrouter('anthropic/claude-3-haiku')
    } else if (provider === 'gemini') {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
         return NextResponse.json({ error: 'Google API Key missing' }, { status: 500 })
      }
      model = google('models/gemini-1.5-flash-latest')
    } else if (provider === 'claude') {
      if (!process.env.ANTHROPIC_API_KEY) {
         return NextResponse.json({ error: 'Anthropic API Key missing' }, { status: 500 })
      }
      model = anthropic('claude-3-haiku-20240307')
    } else {
      return NextResponse.json({ error: 'Invalid AI Provider' }, { status: 500 })
    }

    const systemPrompt = `
      You are an expert AI business assistant built into InvoiceOS AI. 
      You help small business owners manage their clients, draft invoices, write professional emails, and analyze their business performance.
      Be concise, helpful, and professional. Use markdown for formatting.
    `

    const result = await streamText({
      model: model as any,
      messages,
      system: systemPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
