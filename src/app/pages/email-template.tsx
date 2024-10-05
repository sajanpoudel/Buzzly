"use client"

import React, { useState } from 'react'
import { Search, Grid, Moon, Bell, MoreVertical, ChevronDown, ArrowUpRight } from 'lucide-react'
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input type="search" placeholder="Search email or templates" className="pl-10 pr-4 py-2 w-full" />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Grid className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Moon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-4 gap-4 mb-8">
              {statsData.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      <ArrowUpRight className="inline h-3 w-3 mr-1" />
                      {stat.subLabel}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="space-x-2">
                <Link href="/create-template">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">CREATE EMAIL TEMPLATE</Button>
                </Link>
                <Button variant="outline">ADD NEW CLIENT</Button>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-8">
              <Card className="flex-grow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Recently used templates</h2>
                    <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose email templates for time saving</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TEMPLATE</TableHead>
                        <TableHead>FEES</TableHead>
                        <TableHead>SELECTION</TableHead>
                        <TableHead>CUSTOMIZE</TableHead>
                        <TableHead>MORE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templateData.map((template, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg mr-2"></div>
                              <div>
                                <p className="font-medium">{template.name}</p>
                                <p className="text-sm text-gray-500">{template.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{template.price}</TableCell>
                          <TableCell><Button variant="outline" size="sm">PREVIEW</Button></TableCell>
                          <TableCell><Button variant="outline" size="sm">EDIT</Button></TableCell>
                          <TableCell><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="w-80">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">RECENTLY SEND</h2>
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
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.time}</p>
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
    </div>
  )
}