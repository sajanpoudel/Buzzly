"use client"

import React, { useState } from 'react'
import { Search, Moon, Bell, ChevronDown, LayoutDashboard, Mail, Users, Settings, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function CreateTemplate() {
  const [darkMode, setDarkMode] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateFee, setTemplateFee] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [subject, setSubject] = useState('Important Update Regarding Your Loan Application')
  const [body, setBody] = useState(`Dear [Client Name],

I Hope This Message Finds You Well. I Wanted To Provide You With An Update Regarding Your Recent Loan Application. Our Team Is Diligently Processing Your Request And Will Have A Status Update For You Soon.

Thank You For Your Patience And Cooperation During This Process.

Warm Regards,
[Loan Officer Name]
Loan Officer`)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleSaveTemplate = () => {
    // Implement save template logic here
    console.log('Template saved:', { templateName, templateFee, templateCategory, templateDescription, subject, body })
  }

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                Create Template
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input type="search" placeholder="Search..." className="pl-10 pr-4 py-2" />
              </div>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                <Moon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Template Details</CardTitle>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      placeholder="Enter template name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateFee">Template Fee</Label>
                    <Input
                      id="templateFee"
                      placeholder="Enter fee (e.g., $10.00)"
                      value={templateFee}
                      onChange={(e) => setTemplateFee(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateCategory">Category</Label>
                    <Select value={templateCategory} onValueChange={setTemplateCategory}>
                      <SelectTrigger id="templateCategory">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateDescription">Description</Label>
                    <Textarea
                      id="templateDescription"
                      placeholder="Brief description of the template"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    placeholder="Email body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="flex justify-between">
                  <div>
                    <Button variant="outline" className="mr-2">
                      EDIT
                    </Button>
                    <Button variant="outline">
                      TRY ANOTHER TEMPLATE
                    </Button>
                  </div>
                  <Button onClick={handleSaveTemplate} className="bg-purple-600 hover:bg-purple-700 text-white">
                    SAVE TEMPLATE
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}