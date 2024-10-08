"use client"

import React, { useState, useEffect } from 'react'
import { Search, Grid, Moon, Bell, MoreVertical, ChevronDown, ArrowUpRight, Menu, Sun } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

const statsData = [
  { label: "Total email sent", value: "5,325", subLabel: "Check history" },
  { label: "Average open rate", value: "84.20%", subLabel: "Go to the rating" },
  { label: "Average Click rate", value: "3.26%", subLabel: "Go to the ratio" },
  { label: "Unsubscribe rate", value: "4.313%", subLabel: "Rating system" },
]

const templateData = [
  { name: "Popular", description: "Lorem Ipsum idea m...", price: "$12.00" },
  { name: "Regular", description: "Lorem Ipsum idea m...", price: "Free" },
  { name: "Advanced", description: "Lorem Ipsum idea m...", price: "$15.00" },
  { name: "Classic", description: "Lorem Ipsum idea m...", price: "Free" },
  { name: "Professional", description: "Lorem Ipsum idea m...", price: "$10.00" },
]

const recentlySentData = [
  { name: "Deana Curtis", time: "10 mins ago" },
  { name: "Tanya hill", time: "32 mins ago" },
  { name: "Debbi baker", time: "11 : 30 AM, Today" },
  { name: "Jessi Hanson", time: "09 : 56 AM, Today" },
  { name: "Tim Jennings", time: "07 : 32 AM, Today" },
]

export default function EmailTemplateDashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check if dark mode is enabled in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold dark:text-white">Email Templates</h1>
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
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-96 mb-4 lg:mb-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input type="search" placeholder="Search email or templates" className="pl-10 pr-4 py-2 w-full" />
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="hidden lg:inline-flex">
                  <Grid className="h-5 w-5" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsData.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      <ArrowUpRight className="inline h-3 w-3 mr-1" />
                      {stat.subLabel}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 space-y-4 lg:space-y-0">
              <div className="space-y-2 lg:space-y-0 lg:space-x-2 w-full lg:w-auto">
                <Link href="/create-template">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full lg:w-auto mb-2 lg:mb-0">CREATE EMAIL TEMPLATE</Button>
                </Link>
                <Button variant="outline" className="w-full lg:w-auto">ADD NEW CLIENT</Button>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
              <Card className="flex-grow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold dark:text-white">Recently used templates</h2>
                    <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose email templates for time saving</p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="dark:text-gray-300">TEMPLATE</TableHead>
                          <TableHead className="dark:text-gray-300">FEES</TableHead>
                          <TableHead className="dark:text-gray-300">SELECTION</TableHead>
                          <TableHead className="dark:text-gray-300">CUSTOMIZE</TableHead>
                          <TableHead className="dark:text-gray-300">MORE</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templateData.map((template, index) => (
                          <TableRow key={index}>
                            <TableCell className="dark:text-gray-300">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg mr-2"></div>
                                <div>
                                  <p className="font-medium dark:text-white">{template.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="dark:text-gray-300">{template.price}</TableCell>
                            <TableCell><Button variant="outline" size="sm">PREVIEW</Button></TableCell>
                            <TableCell><Button variant="outline" size="sm">EDIT</Button></TableCell>
                            <TableCell><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full lg:w-80">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold dark:text-white">RECENTLY SEND</h2>
                    <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                  <ul className="space-y-4">
                    {recentlySentData.map((item, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>{item.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium dark:text-white">{item.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.time}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm"><ArrowUpRight className="h-4 w-4" /></Button>
                      </li>
                    ))}
                  </ul>
                  <Button variant="link" className="w-full mt-4">View More...</Button>
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