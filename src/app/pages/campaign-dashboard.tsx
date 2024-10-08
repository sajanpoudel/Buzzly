"use client"

import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ArrowUpRight, Bell, Calendar, Clock, HelpCircle, LayoutDashboard, Mail, Moon, MoreVertical, Plus, Search, Menu, Sun } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

const campaignData = [
  { 
    id: 1,
    icon: '🎁',
    title: 'Special Offers for Loyal Customers',
    description: 'Thank you for being our loyal customer! As a token of our appreciation, we...',
    delivered: '5.72K',
    opened: '60.5%',
    clicked: '17.7%',
    converted: '1.2%',
    emails: 2,
    time: 4,
    status: 'Running'
  },
  { 
    id: 2,
    icon: '📝',
    title: 'Customer Feedback Request',
    description: 'We would love to hear your thoughts! Please take a moment to complete o...',
    delivered: '4.82K',
    opened: '34.5%',
    clicked: '6.9%',
    converted: '2.3%',
    emails: 2,
    time: 2,
    status: 'Running'
  },
  { 
    id: 3,
    icon: '🚀',
    title: 'Product Launch Announcement',
    description: 'We are excited to introduce our latest product, Masterclass level! Enjoy inn...',
    delivered: '8.65K',
    opened: '72.5%',
    clicked: '17.7%',
    converted: '1.2%',
    emails: 3,
    time: 3,
    status: 'Running'
  },
  { 
    id: 4,
    icon: '📰',
    title: 'Weekly Newsletter',
    description: 'Hi mate! Here is your weekly newsletter with the latest news, interesting art...',
    delivered: '10.1K',
    opened: '45.2%',
    clicked: '12.8%',
    converted: '0.9%',
    emails: 5,
    time: 5,
    status: 'Running'
  },
]

interface Campaign {
  id: number;
  icon: string;
  title: string;
  description: string;
  delivered: string;
  opened: string;
  clicked: string;
  converted: string;
  emails: number;
  time: number;
  status: string;
}

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
  <Card className="mb-4">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
            {campaign.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{campaign.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">{campaign.emails}</span>
          <Clock className="h-4 w-4 text-gray-400 ml-2" />
          <span className="text-sm text-gray-500">{campaign.time}</span>
          <span className="ml-2 px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
            {campaign.status}
          </span>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivered</p>
          <p className="text-lg font-semibold">{campaign.delivered}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Opened</p>
          <p className="text-lg font-semibold">{campaign.opened}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Clicked</p>
          <p className="text-lg font-semibold">{campaign.clicked}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Converted</p>
          <p className="text-lg font-semibold">{campaign.converted}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function CampaignDashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <h1 className="text-xl font-bold dark:text-white">Campaign Dashboard</h1>
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
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <Card className="mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-center">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-2xl font-bold mb-2">Unlock the Power of Our New Campaign Management Dashboard!</h2>
                    <p className="text-lg">Introducing our latest innovation – a revolutionary dashboard designed to elevate your campaign management.</p>
                  </div>
                  <Button variant="secondary" size="lg" className="w-full lg:w-auto">Try the New Features Now!</Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mb-6 flex-col lg:flex-row space-y-4 lg:space-y-0">
              <h1 className="text-2xl font-bold dark:text-white">Campaigns</h1>
              <Link href="/create-campaign">
                <Button className="w-full lg:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Create Campaign
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Triggered by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {/* Add more options as needed */}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Campaign status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {/* Add more options as needed */}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Filters by tags..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {/* Add more options as needed */}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {/* Add more options as needed */}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="active" className="mb-6">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="active">Active <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">24</span></TabsTrigger>
                <TabsTrigger value="completed">Completed <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">179</span></TabsTrigger>
                <TabsTrigger value="draft">Draft <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">3</span></TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex justify-between items-center mb-4 flex-col lg:flex-row space-y-4 lg:space-y-0">
              <h2 className="text-xl font-semibold dark:text-white">24 Campaigns</h2>
              <div className="flex items-center space-x-2 flex-wrap justify-center lg:justify-start">
                <HelpCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Metrics definitions</span>
                <Calendar className="h-4 w-4 text-gray-400 ml-4" />
                <span className="text-sm text-gray-500 dark:text-gray-400">19 June 2024 - 27 June 2024</span>
              </div>
            </div>

            {campaignData.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
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