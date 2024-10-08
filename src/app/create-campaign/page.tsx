"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CreateCampaign from '@/app/pages/create-campaign'

export default function CreateCampaignPage() {
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

  return <CreateCampaign />
}