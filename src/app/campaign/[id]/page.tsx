"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Sidebar from '@/components/Sidebar'
import EmailTrackingStats from '@/components/EmailTrackingStats'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Legend, ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from "recharts"
import { CampaignData } from '@/types/database'
import { mergeDeviceStats, getEmailStats } from '@/utils/db'

interface DeviceInfo {
  device: string;
  os: string;
  browser: string;
  count: number;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

const BROWSER_COLORS = {
  'Chrome': 'url(#chromeGradient)',
  'Firefox': 'url(#firefoxGradient)',
  'Safari': 'url(#safariGradient)',
  'Edge': 'url(#edgeGradient)',
  'Opera': 'url(#operaGradient)',
  'Unknown': 'url(#unknownGradient)'
};

export default function CampaignDetails() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [deviceStats, setDeviceStats] = useState<DeviceInfo[]>([])

  useEffect(() => {
    const loadCampaign = async () => {
      if (!id) return;
      
      try {
        // Get campaign from Firestore
        const campaignRef = doc(db, 'campaigns', id);
        const campaignSnap = await getDoc(campaignRef);
        
        if (campaignSnap.exists()) {
          const campaignData = campaignSnap.data() as CampaignData;
          setCampaign(campaignData);
          fetchLatestStats(campaignData);
          fetchDeviceStats(campaignData);
        } else {
          console.log('Campaign not found, redirecting to dashboard');
          router.push('/campaign-dashboard');
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        router.push('/campaign-dashboard');
      }
    };

    loadCampaign();
  }, [id, router]);

  const fetchLatestStats = async (campaign: CampaignData) => {
    try {
      // Get stats directly from Firebase since server already updates it
      const campaignRef = doc(db, 'campaigns', campaign.id);
      const campaignSnap = await getDoc(campaignRef);
      
      if (!campaignSnap.exists()) {
        throw new Error('Campaign not found');
      }

      const updatedCampaign = campaignSnap.data() as CampaignData;
      setCampaign(updatedCampaign);

    } catch (error) {
      console.error('Error fetching latest stats:', error);
    }
  };

  const fetchDeviceStats = async (campaign: CampaignData) => {
    try {
      // Get stats directly from Firebase
      const campaignRef = doc(db, 'campaigns', campaign.id);
      const campaignSnap = await getDoc(campaignRef);
      
      if (!campaignSnap.exists()) {
        setDeviceStats([]);
        return;
      }
  
      const campaignData = campaignSnap.data() as CampaignData;
      const deviceInfo = campaignData.stats.deviceInfo || [];
  
      // Process device info
      const deviceMap = new Map();
      deviceInfo.forEach(device => {
        const key = `${device.device}-${device.os}-${device.browser}`;
        const existing = deviceMap.get(key);
        
        if (existing) {
          existing.count++;
        } else {
          deviceMap.set(key, { ...device, count: 1 });
        }
      });
  
      const processedStats = Array.from(deviceMap.values());
      setDeviceStats(processedStats);
  
    } catch (error) {
      console.error('Error fetching device stats:', error);
      setDeviceStats([]);
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

            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailTrackingStats campaignId={campaign.id} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Device Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <Card>
                <CardHeader>
                  <CardTitle>Device and Browser Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {/* Chrome Gradient */}
                          <linearGradient id="chromeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4285F4" />
                            <stop offset="100%" stopColor="#34A853" />
                          </linearGradient>
                          
                          {/* Firefox Gradient */}
                          <linearGradient id="firefoxGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF9500" />
                            <stop offset="100%" stopColor="#FF0039" />
                          </linearGradient>
                          
                          {/* Safari Gradient */}
                          <linearGradient id="safariGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#007AFF" />
                            <stop offset="100%" stopColor="#5856D6" />
                          </linearGradient>
                          
                          {/* Edge Gradient */}
                          <linearGradient id="edgeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0078D7" />
                            <stop offset="100%" stopColor="#00BCF2" />
                          </linearGradient>
                          
                          {/* Opera Gradient */}
                          <linearGradient id="operaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF1B2D" />
                            <stop offset="100%" stopColor="#FF1B2D" />
                          </linearGradient>
                          
                          {/* Unknown Browser Gradient */}
                          <linearGradient id="unknownGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9C27B0" />
                            <stop offset="100%" stopColor="#673AB7" />
                          </linearGradient>
                        </defs>
                        
                        <Pie
                          data={deviceStats}
                          dataKey="count"
                          nameKey="browser"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            value,
                            index
                          }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = 25 + innerRadius + (outerRadius - innerRadius);
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#888888"
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                className="text-xs"
                              >
                                {`${deviceStats[index].browser} (${value})`}
                              </text>
                            );
                          }}
                        >
                          {deviceStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={BROWSER_COLORS[entry.browser as keyof typeof BROWSER_COLORS] || BROWSER_COLORS.Unknown}
                              stroke="none"
                              className="hover:opacity-80 transition-opacity duration-200"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                  <p className="font-semibold">{data.browser}</p>
                                  <p className="text-sm text-gray-500">Device: {data.device}</p>
                                  <p className="text-sm text-gray-500">OS: {data.os}</p>
                                  <p className="text-sm font-medium mt-1">Count: {data.count}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          content={({ payload }) => (
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                              {payload?.map((entry, index) => (
                                <div key={`legend-${index}`} className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ background: entry.color }}
                                  />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {entry.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

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
