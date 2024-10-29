"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { useAuth } from '@/contexts/AuthContext'
import { getCampaigns as getCampaignsDb } from '@/utils/db'
import { CampaignData, CampaignType, DeviceInfo } from '@/types/database'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

const CampaignCard: React.FC<{ campaign: CampaignData; onClick: () => void }> = ({ campaign, onClick }) => {
  const [stats, setStats] = useState(campaign.stats);

  const fetchStats = async () => {
    try {
      // Get stats directly from Firebase
      const campaignRef = doc(db, 'campaigns', campaign.id);
      const campaignSnap = await getDoc(campaignRef);
      
      if (campaignSnap.exists()) {
        const campaignData = campaignSnap.data() as CampaignData;
        // Update local stats state
        setStats(campaignData.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    // Fetch stats immediately and then every 30 seconds
    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [campaign.id]);

  return (
    <Card 
      className="mb-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
              {campaign.type === 'newsletter' ? '📰' : 
               campaign.type === 'promotional' ? '🎯' : '📧'}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{campaign.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
              </p>
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
              campaign.status === 'running' ? 'text-green-800 bg-green-100' : 
              campaign.status === 'completed' ? 'text-blue-800 bg-blue-100' :
              'text-yellow-800 bg-yellow-100'
            }`}>
              {campaign.status}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sent</p>
            <p className="text-lg font-semibold">{stats.sent}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Opened</p>
            <p className="text-lg font-semibold">{stats.opened}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Clicked</p>
            <p className="text-lg font-semibold">{stats.clicked}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Converted</p>
            <p className="text-lg font-semibold">{stats.converted}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
        </div>
       
      </CardContent>
    </Card>
  )
}

export default function CampaignDashboard() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | CampaignType,
    dateRange: undefined,
    audienceSegment: '',
    sortBy: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const { user } = useAuth()

  useEffect(() => {
    if (!user) return;

    const loadCampaigns = async () => {
      try {
        setIsLoading(true);
        
        // Get campaigns directly from Firebase
        const campaignsRef = collection(db, 'campaigns');
        const q = query(
          campaignsRef,
          where('userId', '==', user.id)
        );
        const querySnapshot = await getDocs(q);
        const campaignsData = querySnapshot.docs.map(doc => doc.data() as CampaignData);
        
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaigns();
  }, [user]);

  const updateCampaignStatsFromServer = async (campaign: Campaign) => {
    try {
      const response = await fetch('https://superemailapp-backend.onrender.com/auth/email-stats', {
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

  const handleCampaignClick = (campaign: CampaignData) => {
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
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No campaigns found. Create your first campaign now!
                  </p>
                  <Button 
                    onClick={() => router.push('/create-campaign')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Create Campaign
                  </Button>
                </div>
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
