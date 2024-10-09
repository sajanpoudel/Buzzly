import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, MessageSquare, CreditCard, FileText, Users, Mail, Settings, ChevronDown, ChevronRight, MoreVertical, Sun, Moon, ChevronLeft, User } from 'lucide-react'

interface SidebarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  className?: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

const Sidebar: React.FC<SidebarProps> = ({ darkMode, toggleDarkMode, className, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const storedTokens = localStorage.getItem('gmail_tokens');
      console.log('Stored tokens:', storedTokens); // Debug log

      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        try {
          const response = await fetch('https://emailapp-backend.onrender.com/auth/user-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ tokens }),
          });
          
          console.log('Response status:', response.status); // Debug log

          if (response.ok) {
            const data = await response.json();
            console.log('Fetched user info:', data); // Debug log
            setUserInfo(data);
          } else {
            const errorData = await response.json();
            console.error('Failed to fetch user info:', errorData);
            setError('Failed to fetch user info');
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          setError('Error fetching user info');
        }
      } else {
        console.log('No tokens found in localStorage');
        setError('No authentication tokens found');
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <aside className={`bg-white dark:bg-gray-800 flex flex-col transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 w-64 lg:w-64 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 ${className}`}>
      <div className="flex-1 overflow-y-auto p-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded-lg"></div>
          <span className="text-xl font-bold dark:text-white">Makerkit</span>
        </div>
        <Input placeholder="Search" className="mb-6" />
        <nav className="space-y-1">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <MessageSquare className="mr-2 h-4 w-4" />
            Discuss
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <CreditCard className="mr-2 h-4 w-4" />
            Subscription
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <FileText className="mr-2 h-4 w-4" />
            Contact
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <Users className="mr-2 h-4 w-4" />
            CRM
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <CreditCard className="mr-2 h-4 w-4" />
            Sales
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <FileText className="mr-2 h-4 w-4" />
            Invoice
          </Button>
          <Button variant="ghost" className="w-full justify-start bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200">
            <Mail className="mr-2 h-4 w-4" />
            Email Templates
            <ChevronRight className="ml-auto h-4 w-4" />
          </Button>
          <Link href="/campaign">
            <Button variant="ghost" className="w-full justify-start ml-4 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-200">
              Email Campaigns
            </Button>
          </Link>
          <Link href="/email-template">
            <Button variant="ghost" className="w-full justify-start ml-4 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-200">
              Email Templates
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
      </div>
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            {userInfo && userInfo.picture ? (
              <AvatarImage src={userInfo.picture} alt={userInfo.name || 'User'} />
            ) : (
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium dark:text-white">
              {userInfo ? userInfo.name : 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userInfo ? userInfo.email : error || 'Loading...'}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar