"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Sidebar from '@/components/Sidebar'
import { getCampaigns, Campaign, updateCampaignStats } from '@/utils/campaignStore'
import EmailTrackingStats from '@/components/EmailTrackingStats'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts'

interface DeviceInfo {
  device: string;
  os: string;
  browser: string;
  count: number;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F06292', '#AED581', '#7986CB', '#4DB6AC', '#FFD54F'
];

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

  const prepareChartData = (deviceStats: DeviceInfo[]) => {
    const deviceData: { [key: string]: { [key: string]: number } } = {};

    deviceStats.forEach(stat => {
      if (!deviceData[stat.device]) {
        deviceData[stat.device] = {};
      }
      if (!deviceData[stat.device][stat.browser]) {
        deviceData[stat.device][stat.browser] = 0;
      }
      deviceData[stat.device][stat.browser] += stat.count;
    });

    return Object.entries(deviceData).map(([device, browsers]) => ({
      device,
      ...browsers,
      total: Object.values(browsers).reduce((sum, count) => sum + count, 0),
    }));
  };

  const chartData = prepareChartData(deviceStats);
  const browsers = Array.from(new Set(deviceStats.map(stat => stat.browser)));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="label font-semibold">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Device and Browser Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis 
                        dataKey="device" 
                        tick={{ fill: darkMode ? '#E5E7EB' : '#4B5563' }}
                        axisLine={{ stroke: darkMode ? '#4B5563' : '#9CA3AF' }}
                      />
                      <YAxis 
                        tick={{ fill: darkMode ? '#E5E7EB' : '#4B5563' }}
                        axisLine={{ stroke: darkMode ? '#4B5563' : '#9CA3AF' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ 
                          paddingTop: '20px',
                          color: darkMode ? '#E5E7EB' : '#4B5563'
                        }}
                      />
                      {browsers.map((browser, index) => (
                        <Bar 
                          key={browser} 
                          dataKey={browser} 
                          stackId="a" 
                          fill={COLORS[index % COLORS.length]}
                        >
                          <LabelList 
                            dataKey={browser} 
                            position="inside" 
                            fill="#FFFFFF" 
                            fontSize={12}
                            formatter={(value: number) => (value > 0 ? value : '')}
                          />
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              style={{
                                filter: `brightness(${1 + index * 0.1})`,
                                stroke: darkMode ? '#1F2937' : '#FFFFFF',
                                strokeWidth: 1,
                              }}
                            />
                          ))}
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
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
