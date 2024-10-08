"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/app/pages/dashboard'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const tokens = localStorage.getItem('gmail_tokens')
    if (!tokens) {
      console.log('No tokens found, redirecting to login')
      router.push('/')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <Dashboard />
}