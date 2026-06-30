'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'

export function PayButton({ invoiceId }: { invoiceId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePay = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to initialize checkout')
        setIsLoading(false)
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <Button size="lg" className="w-full md:w-auto" onClick={handlePay} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-5 w-5" />
      )}
      Pay Now
    </Button>
  )
}
