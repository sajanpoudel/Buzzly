"use client"

import React, { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, Bell, Calendar, ChevronDown, ChevronRight, CreditCard, FileText, HelpCircle, LayoutDashboard, Mail, Menu, MessageSquare, Moon, MoreVertical, Search, Settings, Sun, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from 'next/link'
import { TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import Sidebar from '@/components/Sidebar'
import EmailTrackingStats from '@/components/EmailTrackingStats';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  subtext: string;
  icon: React.ReactNode;
}

interface DeliveryCardProps {
  name: string;
  value: string;
  subtext?: string;
  chart: number[];
  icon: React.ReactNode;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  // You can add additional props here if needed
}

const emailData = [
  { year: 2014, clickThrough: 40, openRate: 30 },
  { year: 2015, clickThrough: 55, openRate: 40 },
  { year: 2016, clickThrough: 60, openRate: 25 },
  { year: 2017, clickThrough: 75, openRate: 45 },
  { year: 2018, clickThrough: 58, openRate: 38 },
  { year: 2019, clickThrough: 62, openRate: 42 },
  { year: 2020, clickThrough: 60, openRate: 40 },
  { year: 2021, clickThrough: 58, openRate: 45 },
  { year: 2022, clickThrough: 52, openRate: 48 },
]

const devicePerformance = [
  { device: 'Smartphone', opened: 60, clicks: 50 },
  { device: 'Desktop/Laptop', opened: 90, clicks: 95 },
  { device: 'Tablet', opened: 32, clicks: 18 },
  { device: 'Smartwatch', opened: 65, clicks: 72 },
  { device: 'Other', opened: 42, clicks: 35 },
]

const deliveryData = [
  { name: 'Delivered Rate', value: '100%', subtext: '38 Delivered', chart: [30, 45, 35, 40, 35, 30, 40] },
  { name: 'Hard Bounce Rate', value: '85%', subtext: '', chart: [10, 5, 15, 35, 40, 35, 20] },
  { name: 'Unsubscribed Rate', value: '28%', subtext: '', chart: [20, 25, 18, 30, 28, 35, 22] },
  { name: 'Spam Report Rate', value: '0.7%', subtext: '', chart: [5, 8, 6, 10, 7, 5, 8] },
]

const StatCard: React.FC<StatCardProps> = ({ title, value, change, subtext, icon }) => (
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
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
          {change}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
    </CardContent>
  </Card>
)

const DeliveryCard: React.FC<DeliveryCardProps> = ({ name, value, subtext, chart, icon }) => (
  <Card className="flex-1 overflow-hidden">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{name}</h3>
          <div className="text-2xl font-bold dark:text-white">{value}</div>
          {subtext && <p className="text-sm text-yellow-500 dark:text-yellow-400">{subtext}</p>}
        </div>
        {icon}
      </div>
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart.map((value, index) => ({ name: index, value }))}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
)

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg">
        {payload.map((pld, index) => (
          <p key={index} className="text-gray-700 dark:text-gray-300">
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
        <p className="text-gray-700 dark:text-gray-300">{`${label}`}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [trackingIds, setTrackingIds] = useState<string[]>([]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  useEffect(() => {
    // Fetch tracking IDs from localStorage or your backend
    const storedTrackingIds = localStorage.getItem('trackingIds');
    if (storedTrackingIds) {
      setTrackingIds(JSON.parse(storedTrackingIds));
    }
  }, []);

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold dark:text-white">Email Analytics</h1>
            <div className="flex items-center space-x-4">
              <Link href="/create-campaign">
                <Button variant="outline">Create Campaign</Button>
              </Link>
              <Select defaultValue="30">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Sent" 
              value="1,181" 
              change="+0.5%" 
              subtext="104 Emails" 
              icon={<ArrowUpRight className="h-4 w-4 ml-1" />} 
            />
            <StatCard 
              title="Open Rate" 
              value="86.84%" 
              change="-1.7%" 
              subtext="33 Opened" 
              icon={<ArrowUpRight className="h-4 w-4 ml-1" />} 
            />
            <StatCard 
              title="Click Rate" 
              value="2.63%" 
              change="-2.3%" 
              subtext="1 Clicked" 
              icon={<ArrowUpRight className="h-4 w-4 ml-1" />} 
            />
            <StatCard 
              title="Click Through" 
              value="3.03%" 
              change="+1.0%" 
              subtext="15 Click Through" 
              icon={<ArrowUpRight className="h-4 w-4 ml-1" />} 
            />
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Delivery</h2>
              <Button variant="outline" size="sm">
                SAVE REPORT
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deliveryData.map((item, index) => (
                <DeliveryCard
                  key={index}
                  name={item.name}
                  value={item.value}
                  subtext={item.subtext}
                  chart={item.chart}
                  icon={<HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Email Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailTrackingStats trackingIds={trackingIds} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Email Data Chart</h2>
                <ResponsiveContainer width="100%" height={300}>
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
                    <XAxis dataKey="year" stroke="#888888" />
                    <YAxis stroke="#888888" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="clickThrough" stroke="#8884d8" fillOpacity={1} fill="url(#colorClickThrough)" />
                    <Area type="monotone" dataKey="openRate" stroke="#82ca9d" fillOpacity={1} fill="url(#colorOpenRate)" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex justify-center mt-4">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Click through rate</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Open rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Performance By Device Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={devicePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" stroke="#888888" />
                    <YAxis stroke="#888888" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="opened" fill="url(#colorClickThrough)" />
                    <Bar dataKey="clicks" fill="url(#colorOpenRate)" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center mt-4">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Opened</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Clicks</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}