"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokens = searchParams.get('tokens')
    if (tokens) {
      localStorage.setItem('gmail_tokens', tokens)
      console.log('Redirecting to /create-campaign')
      router.push('/create-campaign')
    } else {
      console.error('No tokens received')
      router.push('/')
    }
  }, [router, searchParams])

  return <div>Processing authentication...</div>
}