'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function ConnectStripeButton() {
  const [isLoading, setIsLoading] = useState(false)

  const connectStripe = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to connect to Stripe')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={connectStripe} disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Connect with Stripe
    </Button>
  )
}
