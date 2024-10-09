"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Sidebar from '@/components/Sidebar'
import { getCampaigns, Campaign } from '@/utils/campaignStore'
import EmailTrackingStats from '@/components/EmailTrackingStats'

export default function CampaignDetails() {
  const router = useRouter()
  const { id } = router.query
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (id) {
      const campaigns = getCampaigns()
      const foundCampaign = campaigns.find(c => c.id === id)
      if (foundCampaign) {
        setCampaign(foundCampaign)
      } else {
        // Handle campaign not found
        router.push('/campaign-dashboard')
      }
    }
  }, [id, router])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  if (!campaign) {
    return <div>Loading...</div>
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      {/* ... (add header similar to campaign-dashboard.tsx) */}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          className="hidden lg:block"
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{campaign.name}</h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Type:</strong> {campaign.type}</p>
                <p><strong>Status:</strong> {campaign.status}</p>
                <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
                <p><strong>Recipients:</strong> {campaign.recipients.length}</p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Campaign Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sent</p>
                    <p className="text-2xl font-bold">{campaign.stats.sent}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Opened</p>
                    <p className="text-2xl font-bold">{campaign.stats.opened}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Clicked</p>
                    <p className="text-2xl font-bold">{campaign.stats.clicked}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Converted</p>
                    <p className="text-2xl font-bold">{campaign.stats.converted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Email Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailTrackingStats trackingIds={campaign.trackingIds} />
              </CardContent>
            </Card>

            <Button 
              onClick={() => router.push('/campaign-dashboard')} 
              className="mt-8"
            >
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>

      {/* ... (add mobile sidebar similar to campaign-dashboard.tsx) */}
    </div>
  )
}