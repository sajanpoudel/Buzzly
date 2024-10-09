"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ArrowUpRight, Bell, Calendar, Clock, HelpCircle, LayoutDashboard, Mail, Moon, MoreVertical, Plus, Search, Menu, Sun, Loader } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { getInitialsFromEmail } from '@/utils/stringUtils';
import { getCampaigns, updateCampaignStats, Campaign } from '@/utils/campaignStore';
import EmailTrackingStats from '@/components/EmailTrackingStats';

const CampaignCard: React.FC<{ campaign: Campaign; onClick: () => void }> = ({ campaign, onClick }) => (
  <Card className="mb-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
            📧
          </div>
          <div>
            <h3 className="text-lg font-semibold">{campaign.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">{campaign.recipients.length}</span>
          <Clock className="h-4 w-4 text-gray-400 ml-2" />
          <span className="text-sm text-gray-500">
            {Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
          </span>
          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
            campaign.status === 'Running' ? 'text-green-800 bg-green-100' : 
            campaign.status === 'Completed' ? 'text-blue-800 bg-blue-100' :
            'text-yellow-800 bg-yellow-100'
          }`}>
            {campaign.status}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sent</p>
          <p className="text-lg font-semibold">{campaign.stats.sent}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Opened</p>
          <p className="text-lg font-semibold">{campaign.stats.opened}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Clicked</p>
          <p className="text-lg font-semibold">{campaign.stats.clicked}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Converted</p>
          <p className="text-lg font-semibold">{campaign.stats.converted}</p>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
      </div>
    </CardContent>
  </Card>
)

export default function CampaignDashboard() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  useEffect(() => {
    const fetchUserInfo = async () => {
      const storedTokens = localStorage.getItem('gmail_tokens');
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        try {
          const response = await fetch('https://emailapp-backend.onrender.com/auth/user-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tokens }),
          });
          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          } else {
            console.error('Failed to fetch user info');
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    const loadCampaigns = async () => {
      const storedCampaigns = getCampaigns();
      setCampaigns(storedCampaigns);
      setIsLoading(false);

      // Fetch and update stats for each campaign
      for (const campaign of storedCampaigns) {
        await updateCampaignStatsFromServer(campaign);
      }
    };

    fetchUserInfo();
    loadCampaigns();
  }, []);

  const updateCampaignStatsFromServer = async (campaign: Campaign) => {
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
        setCampaigns(prevCampaigns => 
          prevCampaigns.map(c => 
            c.id === campaign.id ? { ...c, stats: { ...c.stats, ...stats } } : c
          )
        );
      }
    } catch (error) {
      console.error('Error updating campaign stats:', error);
    }
  };

  const handleCampaignClick = (campaign: Campaign) => {
    router.push(`/campaign/${campaign.id}`);
  };

  const handleRefreshStats = async () => {
    setIsLoading(true);
    for (const campaign of campaigns) {
      await updateCampaignStatsFromServer(campaign);
    }
    setIsLoading(false);
  };

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
                <Input placeholder="Search campaigns..." className="pl-8 w-full" />
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
                    <h2 className="text-2xl font-bold mb-2">Welcome to Your Campaign Dashboard!</h2>
                    <p className="text-lg">Track and optimize your email campaigns with ease.</p>
                  </div>
                  <Link href="/create-campaign">
                    <Button variant="secondary" size="lg" className="w-full lg:w-auto">
                      <Plus className="mr-2 h-4 w-4" /> Create New Campaign
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold dark:text-white">Your Campaigns</h2>
                <Button onClick={handleRefreshStats} disabled={isLoading}>
                  {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                  Refresh Stats
                </Button>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : campaigns.length > 0 ? (
                campaigns.map(campaign => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign} 
                    onClick={() => handleCampaignClick(campaign)}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No campaigns found. Create your first campaign now!</p>
              )}
            </div>

            {/* Add more sections here for campaign analytics, performance charts, etc. */}
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