"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardSkeleton from '@/app/pages/dashboard-skeleton'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  console.log('redirect');

  useEffect(() => {
    const handleAuth = () => {
      if (!searchParams) {
        console.error('No search params available')
        router.push('/')
        return
      }

      const tokens = searchParams.get('tokens')
      console.log('Tokens:', tokens)
      
      if (tokens) {
        localStorage.setItem('gmail_tokens', tokens)
        console.log('Redirecting to /dashboard')
        router.push('/dashboard')
      } else {
        console.error('No tokens received')
        router.push('/')
      }
    }

    handleAuth()
  }, [router, searchParams])

  return <DashboardSkeleton />
}
