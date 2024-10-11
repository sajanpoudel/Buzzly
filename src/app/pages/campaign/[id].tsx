"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Sidebar from '@/components/Sidebar'
import { getCampaigns, Campaign } from '@/utils/campaignStore'
import EmailTrackingStats from '@/components/EmailTrackingStats'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader } from 'lucide-react';

interface DeviceInfo {
  device: string;
  os: string;
  browser: string;
  count: number;
}

interface EmailStatsResponse {
  totalSent: number;
  totalOpened: number;
  totalClicks: number;
  uniqueOpens: number;
  detailedStats: Array<{
    id: string;
    email: string;
    openCount: number;
    clickCount: number;
    lastOpened: string;
    lastClicked: string | null;
    devices: DeviceInfo[];
  }>;
}

const DeviceStats: React.FC<{ trackingIds: string[] }> = ({ trackingIds }) => {
  const [deviceStats, setDeviceStats] = useState<DeviceInfo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeviceStats = async () => {
    try {
      const response = await fetch('https://emailapp-backend.onrender.com/auth/email-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingIds }),
      });
      const data: EmailStatsResponse = await response.json();
      console.log('Received email stats:', JSON.stringify(data, null, 2));

      const deviceMap = new Map<string, DeviceInfo>();
      data.detailedStats.forEach((stat) => {
        (stat.devices || []).forEach((device) => {
          const key = `${device.device}-${device.os}-${device.browser}`;
          if (deviceMap.has(key)) {
            deviceMap.get(key)!.count += 1;
          } else {
            deviceMap.set(key, { ...device, count: 1 });
          }
        });
      });

      const processedDeviceStats = Array.from(deviceMap.values());
      setDeviceStats(processedDeviceStats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching device stats:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceStats();
    const interval = setInterval(fetchDeviceStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [trackingIds]);

  const chartData = deviceStats.map(stat => ({
    name: `${stat.device} - ${stat.os} - ${stat.browser}`,
    count: stat.count
  }));

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Device Information</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : deviceStats.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {deviceStats.map((device, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="font-semibold">{device.device}</p>
                  <p><strong>OS:</strong> {device.os}</p>
                  <p><strong>Browser:</strong> {device.browser}</p>
                  <p><strong>Count:</strong> {device.count}</p>
                </div>
              ))}
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p>No device information available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default function CampaignDetails() {
  const router = useRouter()
  const { id } = router.query
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    console.log('CampaignDetails component mounted');
    if (id) {
      console.log(`Fetching campaign details for id: ${id}`);
      const campaigns = getCampaigns()
      const foundCampaign = campaigns.find(c => c.id === id)
      if (foundCampaign) {
        console.log('Campaign found:', JSON.stringify(foundCampaign, null, 2));
        setCampaign(foundCampaign)
      } else {
        console.log('Campaign not found, redirecting to dashboard');
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
      <header className="bg-white dark:bg-gray-800 shadow-sm lg:hidden">
        {/* ... (mobile header content) */}
      </header>

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
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailTrackingStats trackingIds={campaign.trackingIds} />
              </CardContent>
            </Card>

            {/* DeviceStats component placed here */}
            <DeviceStats trackingIds={campaign.trackingIds} />

            <Button 
              onClick={() => router.push('/campaign-dashboard')} 
              className="mt-8"
            >
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <Sidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        className="lg:hidden"
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </div>
  )
}