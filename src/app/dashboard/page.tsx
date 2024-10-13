"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/app/pages/dashboard'
import DashboardSkeleton from '@/app/pages/dashboard-skeleton'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const tokens = localStorage.getItem('gmail_tokens')
    if (!tokens) {
      console.log('No tokens found, redirecting to login')
      router.push('/')
    } else {
      // Simulate loading time
      setTimeout(() => {
        setIsLoading(false)
      }, 2000) // Adjust this time as needed
    }
  }, [router])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return <Dashboard />
}
