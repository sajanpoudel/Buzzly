import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, MessageSquare, CreditCard, FileText, Users, Mail, Settings, ChevronDown, ChevronRight, MoreVertical, Sun, Moon } from 'lucide-react'

interface SidebarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ darkMode, toggleDarkMode }) => (
  <aside className="w-64 bg-white dark:bg-gray-800 p-6 flex flex-col overflow-y-auto transition-colors duration-200">
    <div className="flex items-center space-x-2 mb-8">
      <div className="w-8 h-8 bg-purple-600 rounded-lg"></div>
      <span className="text-xl font-bold dark:text-white">Makerkit</span>
    </div>
    <div className="flex-1">
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
    <div className="flex items-center mt-6">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/placeholder-user.jpg" alt="Darrell Steward" />
        <AvatarFallback>DS</AvatarFallback>
      </Avatar>
      <div className="ml-3">
        <p className="text-sm font-medium dark:text-white">Darrell Steward</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">tanya@example.com</p>
      </div>
      <Button variant="ghost" size="icon" className="ml-auto">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
    <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
      {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  </aside>
)

export default Sidebar