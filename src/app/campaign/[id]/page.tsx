"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Sidebar from '@/components/Sidebar'
import { getCampaigns, Campaign, updateCampaignStats } from '@/utils/campaignStore'
import EmailTrackingStats from '@/components/EmailTrackingStats'
import { useRouter } from 'next/navigation'

interface DeviceInfo {
  device: string;
  os: string;
  browser: string;
  count: number;
}

export default function CampaignDetails() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [deviceStats, setDeviceStats] = useState<DeviceInfo[]>([])

  useEffect(() => {
    if (id) {
      const campaigns = getCampaigns()
      const foundCampaign = campaigns.find(c => c.id === id)
      if (foundCampaign) {
        setCampaign(foundCampaign)
        fetchLatestStats(foundCampaign)
        fetchDeviceStats(foundCampaign)
      } else {
        router.push('/campaign-dashboard')
      }
    }
  }, [id, router])

  const fetchLatestStats = async (campaign: Campaign) => {
    try {
      const response = await fetch('https://emailapp-backend.onrender.com/auth/email-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include',
        body: JSON.stringify({ trackingIds: campaign.trackingIds })
      });
      if (response.ok) {
        const stats = await response.json();
        updateCampaignStats(campaign.id, stats);
        setCampaign({ ...campaign, stats: { ...campaign.stats, ...stats } });
      }
    } catch (error) {
      console.error('Error fetching latest stats:', error);
    }
  }

  const fetchDeviceStats = async (campaign: Campaign) => {
    try {
      const response = await fetch('https://emailapp-backend.onrender.com/auth/email-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingIds: campaign.trackingIds }),
      });
      const data = await response.json();
      const deviceMap = new Map<string, DeviceInfo>();
      data.detailedStats.forEach((stat: any) => {
        (stat.devices || []).forEach((device: any) => {
          const key = `${device.device}-${device.os}-${device.browser}`;
          if (deviceMap.has(key)) {
            deviceMap.get(key)!.count++;
          } else {
            deviceMap.set(key, { ...device, count: 1 });
          }
        });
      });
      setDeviceStats(Array.from(deviceMap.values()));
    } catch (error) {
      console.error('Error fetching device stats:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  if (!campaign) {
    return <div>Loading...</div>
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
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
            <h1 className="text-3xl font-bold mb-6 dark:text-white">{campaign.name}</h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-lg font-semibold dark:text-white">{campaign.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-lg font-semibold dark:text-white">{campaign.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="text-lg font-semibold dark:text-white">{new Date(campaign.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="text-lg font-semibold dark:text-white">{new Date(campaign.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recipients</p>
                  <p className="text-lg font-semibold dark:text-white">{campaign.recipients.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recurring</p>
                  <p className="text-lg font-semibold dark:text-white">{campaign.isRecurring ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailTrackingStats trackingIds={campaign.trackingIds} />
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {deviceStats.map((device, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                      <p className="font-medium text-lg mb-2">{device.device}</p>
                      <p className="text-sm mb-1">OS: {device.os}</p>
                      <p className="text-sm mb-1">Browser: {device.browser}</p>
                      <p className="text-sm font-semibold">Count: {device.count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-between">
              <Button 
                onClick={() => router.push('/campaign-dashboard')} 
                variant="outline"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => {
                  fetchLatestStats(campaign);
                  fetchDeviceStats(campaign);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Refresh Stats
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
