'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Bot, MessageSquare, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export function CopilotChat() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg p-0 flex items-center justify-center bg-primary text-primary-foreground hover:scale-105 transition-transform z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 sm:w-96 shadow-2xl flex flex-col z-50 h-[500px] border-border overflow-hidden animate-in slide-in-from-bottom-5">
      <CardHeader className="p-4 border-b bg-muted/50 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-md">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">InvoiceOS Copilot</CardTitle>
            <p className="text-xs text-muted-foreground">Your AI Business Assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <ScrollArea className="flex-1 p-4 bg-background">
        <div className="flex flex-col gap-4" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground mt-10">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Hi! I'm your AI Copilot.</p>
              <p>Ask me to draft an email, analyze your invoices, or help you grow your business.</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col gap-1 ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`px-3 py-2 rounded-xl max-w-[85%] text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                }`}
              >
                {/* A real app might use react-markdown here */}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-muted px-3 py-2 rounded-xl rounded-bl-sm flex gap-1 items-center h-9">
                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <CardFooter className="p-3 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Copilot..."
            className="flex-1 h-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
