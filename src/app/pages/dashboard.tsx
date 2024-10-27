"use client"

import React, { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, Bell, Calendar, ChevronDown, LayoutDashboard, Mail, Menu, MessageSquare, Moon, MoreVertical, Search, Settings, Sun, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { getCampaigns } from '@/utils/db'
import { CampaignData, CampaignType } from '@/types/database'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getInitialsFromEmail } from '@/utils/stringUtils'
import { subDays, subMonths, subYears, startOfDay } from 'date-fns';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  subtext: string;
  icon: React.ReactNode;
}> = ({ title, value, change, subtext, icon }) => (
  <Card className="flex-1 overflow-hidden">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
            {title}
            {icon}
          </h3>
          <div className="text-2xl font-bold dark:text-white">{value}</div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          change.startsWith('+') ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toFixed(2)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; picture: string } | null>(null)
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    totalCampaigns: 0,
    totalEmails: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0
  })
  const [emailData, setEmailData] = useState<any[]>([])
  const [devicePerformance, setDevicePerformance] = useState<any[]>([])
  const [filters, setFilters] = useState({
    campaignType: 'all' as 'all' | CampaignType,
    dateRange: {
      start: undefined as Date | undefined,
      end: undefined as Date | undefined
    },
    audienceSegment: 'all',
    sortBy: 'date' as 'date' | 'openRate' | 'clickRate' | 'conversionRate'
  });

  // Add date range options
  const dateRangeOptions = [
    { label: 'Last 24 hours', value: '1day', 
      dates: { start: subDays(new Date(), 1), end: new Date() } },
    { label: 'Last 7 days', value: '7days', 
      dates: { start: subDays(new Date(), 7), end: new Date() } },
    { label: 'Last month', value: '1month', 
      dates: { start: subMonths(new Date(), 1), end: new Date() } },
    { label: 'Last year', value: '1year', 
      dates: { start: subYears(new Date(), 1), end: new Date() } },
    { label: 'All time', value: 'all', 
      dates: { start: undefined, end: undefined } }
  ];

  const handleDateRangeChange = (value: string) => {
    const selectedRange = dateRangeOptions.find(option => option.value === value);
    if (selectedRange) {
      setFilters(prev => ({
        ...prev,
        dateRange: {
          start: selectedRange.dates.start,
          end: selectedRange.dates.end
        }
      }));
    }
  };

  const filterSection = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Select
        value={filters.campaignType}
        onValueChange={(value: 'all' | CampaignType) => setFilters(prev => ({ ...prev, campaignType: value }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Campaign Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="newsletter">Newsletter</SelectItem>
          <SelectItem value="promotional">Promotional</SelectItem>
          <SelectItem value="transactional">Transactional</SelectItem>
          <SelectItem value="general">General</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.dateRange.start ? 
          dateRangeOptions.find(option => 
            option.dates.start?.getTime() === filters.dateRange.start?.getTime()
          )?.value || 'all' 
          : 'all'
        }
        onValueChange={handleDateRangeChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.audienceSegment}
        onValueChange={(value) => setFilters(prev => ({ ...prev, audienceSegment: value }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Audience Segment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Segments</SelectItem>
          <SelectItem value="new">New Users</SelectItem>
          <SelectItem value="active">Active Users</SelectItem>
          <SelectItem value="inactive">Inactive Users</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy}
        onValueChange={(value: 'date' | 'openRate' | 'clickRate' | 'conversionRate') => 
          setFilters(prev => ({ ...prev, sortBy: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="openRate">Open Rate</SelectItem>
          <SelectItem value="clickRate">Click Rate</SelectItem>
          <SelectItem value="conversionRate">Conversion Rate</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Get campaigns with filters
        let campaigns = await getCampaigns(user.id, {
          type: filters.campaignType === 'all' ? undefined : filters.campaignType,
          dateRange: filters.dateRange.start && filters.dateRange.end ? {
            start: startOfDay(filters.dateRange.start),
            end: filters.dateRange.end
          } : undefined,
          audienceSegment: filters.audienceSegment === 'all' ? undefined : filters.audienceSegment,
          sortBy: filters.sortBy === 'date' ? undefined : filters.sortBy
        });

        // Apply sorting if needed
        if (filters.sortBy !== 'date') {
          campaigns = campaigns.sort((a, b) => {
            const getRate = (campaign: CampaignData) => {
              const total = campaign.recipients.length;
              switch (filters.sortBy) {
                case 'openRate':
                  return (campaign.stats.opened / total) * 100;
                case 'clickRate':
                  return (campaign.stats.clicked / total) * 100;
                case 'conversionRate':
                  return (campaign.stats.converted / total) * 100;
                default:
                  return 0;
              }
            };
            return getRate(b) - getRate(a);
          });
        }

        // Calculate total stats
        const stats = campaigns.reduce((acc, campaign) => {
          acc.totalCampaigns++;
          acc.totalEmails += campaign.recipients.length;
          acc.openRate += campaign.stats.opened;
          acc.clickRate += campaign.stats.clicked;
          acc.conversionRate += campaign.stats.converted;
          return acc;
        }, {
          totalCampaigns: 0,
          totalEmails: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0
        });

        // Calculate averages
        if (stats.totalEmails > 0) {
          stats.openRate = (stats.openRate / stats.totalEmails) * 100;
          stats.clickRate = (stats.clickRate / stats.totalEmails) * 100;
          stats.conversionRate = (stats.conversionRate / stats.totalEmails) * 100;
        }

        setDashboardStats(stats);

        // Process campaign data for email performance chart
        const emailPerformanceData = campaigns.reduce((acc: any, campaign) => {
          const date = new Date(campaign.createdAt).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = {
              date,
              clickThrough: 0,
              openRate: 0,
              total: 0
            };
          }
          acc[date].total++;
          acc[date].clickThrough += (campaign.stats.clicked / campaign.recipients.length) * 100;
          acc[date].openRate += (campaign.stats.opened / campaign.recipients.length) * 100;
          return acc;
        }, {});

        // Convert to array and calculate averages
        const processedEmailData = Object.values(emailPerformanceData).map((data: any) => ({
          ...data,
          clickThrough: data.clickThrough / data.total,
          openRate: data.openRate / data.total
        }));

        setEmailData(processedEmailData);

        // Process device performance data - Updated version
        const deviceStats = campaigns.reduce((acc: any, campaign) => {
          // Get email stats for this campaign
          campaign.trackingIds.forEach(trackingId => {
            // Default device data if no device info
            const defaultDevices = [{
              device: 'Desktop',
              opened: campaign.stats.opened > 0 ? 1 : 0,
              clicks: campaign.stats.clicked > 0 ? 1 : 0
            }];

            // Use deviceInfo if available, otherwise use default
            const devices = campaign.stats.deviceInfo || defaultDevices;

            devices.forEach(device => {
              const deviceName = device.device || 'Unknown';
              if (!acc[deviceName]) {
                acc[deviceName] = {
                  device: deviceName,
                  opened: 0,
                  clicks: 0,
                  total: 0
                };
              }
              acc[deviceName].total++;
              if (campaign.stats.opened > 0) acc[deviceName].opened++;
              if (campaign.stats.clicked > 0) acc[deviceName].clicks++;
            });
          });
          return acc;
        }, {});

        // Convert to array and calculate percentages
        const processedDeviceData = Object.values(deviceStats).map((data: any) => ({
          device: data.device,
          opened: data.total > 0 ? (data.opened / data.total) * 100 : 0,
          clicks: data.total > 0 ? (data.clicks / data.total) * 100 : 0
        }));

        // Add some default data if no device data is available
        if (processedDeviceData.length === 0) {
          processedDeviceData.push(
            { device: 'Desktop', opened: 0, clicks: 0 },
            { device: 'Mobile', opened: 0, clicks: 0 },
            { device: 'Tablet', opened: 0, clicks: 0 }
          );
        }

        setDevicePerformance(processedDeviceData);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, filters]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          className="hidden lg:block"
        />
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 flex-col lg:flex-row space-y-4 lg:space-y-0">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter by name or description..." className="pl-8 w-full" />
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="hidden lg:inline-flex">
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleDarkMode}>
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="hidden lg:inline-flex">
                  <Bell className="h-5 w-5" />
                </Button>
                <Avatar>
                  {userInfo && userInfo.picture ? (
                    <AvatarImage src={userInfo.picture} alt={userInfo.name || userInfo.email} />
                  ) : (
                    <AvatarFallback>
                      {userInfo ? getInitialsFromEmail(userInfo.email) : 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>

            <Card className="mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-center">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-2xl font-bold mb-2">Welcome to Your Email Analytics Dashboard!</h2>
                    <p className="text-lg">Track and analyze your email campaign performance with ease.</p>
                  </div>
                  <Button variant="secondary" size="lg" className="w-full lg:w-auto">Explore Features</Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mb-6 flex-col lg:flex-row space-y-4 lg:space-y-0">
              <h1 className="text-2xl font-bold dark:text-white">Email Analytics</h1>
              <Link href="/create-campaign">
                <Button className="w-full lg:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Create Campaign
                </Button>
              </Link>
            </div>

            {filterSection}  {/* Add this line */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard 
                title="Total Campaigns" 
                value={dashboardStats.totalCampaigns.toString()}
                change={`+${((dashboardStats.totalCampaigns / 100) * 100).toFixed(1)}%`}
                subtext={`${dashboardStats.totalCampaigns} Active Campaigns`}
                icon={<ArrowUpRight className="h-4 w-4 ml-1" />} 
              />
              <StatCard 
                title="Open Rate" 
                value={`${dashboardStats.openRate.toFixed(2)}%`}
                change={`${dashboardStats.openRate > 50 ? '+' : '-'}${Math.abs(dashboardStats.openRate - 50).toFixed(1)}%`}
                subtext={`${Math.round(dashboardStats.totalEmails * (dashboardStats.openRate / 100))} Opened`}
                icon={<ArrowUpRight className="h-4 w-4 ml-1" />} 
              />
              <StatCard 
                title="Click Rate" 
                value={`${dashboardStats.clickRate.toFixed(2)}%`}
                change={`${dashboardStats.clickRate > 30 ? '+' : '-'}${Math.abs(dashboardStats.clickRate - 30).toFixed(1)}%`}
                subtext={`${Math.round(dashboardStats.totalEmails * (dashboardStats.clickRate / 100))} Clicked`}
                icon={<ArrowUpRight className="h-4 w-4 ml-1" />} 
              />
              <StatCard 
                title="Conversion Rate" 
                value={`${dashboardStats.conversionRate.toFixed(2)}%`}
                change={`${dashboardStats.conversionRate > 20 ? '+' : '-'}${Math.abs(dashboardStats.conversionRate - 20).toFixed(1)}%`}
                subtext={`${Math.round(dashboardStats.totalEmails * (dashboardStats.conversionRate / 100))} Converted`}
                icon={<ArrowUpRight className="h-4 w-4 ml-1" />} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 dark:text-white">Email Performance Trends</h2>
                  <div className="h-[300px] lg:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={emailData}>
                        <defs>
                          <linearGradient id="colorClickThrough" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOpenRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#888888" />
                        <YAxis stroke="#888888" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="openRate" 
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#colorClickThrough)" 
                          name="Open Rate"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="clickRate" 
                          stroke="#82ca9d" 
                          fillOpacity={1} 
                          fill="url(#colorOpenRate)" 
                          name="Click Rate"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 dark:text-white">Performance By Device Type</h2>
                  <div className="h-[300px] lg:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={devicePerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="device" type="category" width={100} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="opened" 
                          fill="url(#colorClickThrough)" 
                          name="Opened"
                        />
                        <Bar 
                          dataKey="clicks" 
                          fill="url(#colorOpenRate)" 
                          name="Clicks"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
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
