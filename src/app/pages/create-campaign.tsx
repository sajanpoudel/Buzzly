"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Moon, Bell, ChevronDown, LayoutDashboard, Mail, Users, Settings, MoreVertical, Calendar as CalendarIcon, Upload, Sparkles, Sun, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import SuccessModal from '@/components/SuccessModal'

const emailTemplates = [
  { id: 1, name: "Welcome Email", subject: "Welcome to Our Service!", body: "Dear [Name],\n\nWelcome to our service! We're excited to have you on board..." },
  { id: 2, name: "Monthly Newsletter", subject: "Your Monthly Update", body: "Hello [Name],\n\nHere's what's new this month..." },
  { id: 3, name: "Product Announcement", subject: "Introducing Our Latest Product", body: "Hi [Name],\n\nWe're thrilled to announce our newest product..." },
]

export default function CreateCampaign() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [tokens, setTokens] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [campaignType, setCampaignType] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sendDate, setSendDate] = useState<Date | undefined>(undefined)
  const [targetAudience, setTargetAudience] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [audienceFile, setAudienceFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState('details')
  const [csvData, setCsvData] = useState<{ name: string; email: string }[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const storedTokens = localStorage.getItem('gmail_tokens')
      if (storedTokens) {
        const parsedTokens = JSON.parse(storedTokens)
        setTokens(parsedTokens)
        setIsAuthenticated(true)
        // Fetch user email using the access token
        try {
          const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${parsedTokens.access_token}`,
            },
          })
          const data = await response.json()
          setUserEmail(data.email)
        } catch (error) {
          console.error('Error fetching user info:', error)
        }
      } else {
        router.push('/') // Redirect to login page if not authenticated
      }
    }
    checkAuth()
  }, [router])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleSaveCampaign = async () => {
    if (!isAuthenticated) {
      console.error('User is not authenticated')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/auth/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: csvData,
          subject,
          body,
          userEmail,
          tokens,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send emails')
      }

      const result = await response.json()
      console.log('Campaign saved and emails sent:', result)
      
      // Show success modal
      setModalMessage(`Emails sent successfully to ${result.info.length} recipients!`)
      setIsModalOpen(true)
      
      // Optionally, reset form or redirect here
    } catch (error) {
      console.error('Error saving campaign and sending emails:', error)
      // Show error modal
      setModalMessage('Error sending emails. Please try again.')
      setIsModalOpen(true)
    }
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = emailTemplates.find(t => t.id.toString() === templateId)
    if (template) {
      setSubject(template.subject)
      setBody(template.body)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const rows = text.split('\n').slice(1) // Skip header row
        const parsedData = rows.map(row => {
          const [name, email] = row.split(',')
          return { name: name.trim(), email: email.trim() }
        })
        setCsvData(parsedData)
        setAudienceFile(file)
      }
      reader.readAsText(file)
    }
  }

  const handleNext = () => {
    if (activeTab === 'details') {
      setActiveTab('content')
    } else if (activeTab === 'content') {
      setActiveTab('audience')
    }
  }

  const handleBack = () => {
    if (activeTab === 'content') {
      setActiveTab('details')
    } else if (activeTab === 'audience') {
      setActiveTab('content')
    }
  }

  if (!isAuthenticated) {
    return <div>Loading...</div> // Or a more sophisticated loading state
  }

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                Create Campaign
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input type="search" placeholder="Search..." className="pl-10 pr-4 py-2" />
              </div>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Campaign Details</CardTitle>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="details">Campaign Details</TabsTrigger>
                  <TabsTrigger value="content">Email Content</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="campaignName">Campaign Name</Label>
                        <Input
                          id="campaignName"
                          placeholder="Enter campaign name"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="campaignType">Campaign Type</Label>
                        <Select value={campaignType} onValueChange={setCampaignType}>
                          <SelectTrigger id="campaignType">
                            <SelectValue placeholder="Select campaign type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                            <SelectItem value="promotional">Promotional</SelectItem>
                            <SelectItem value="transactional">Transactional</SelectItem>
                            <SelectItem value="automated">Automated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sendDate">Send Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={`w-full justify-start text-left font-normal ${!sendDate && "text-muted-foreground"}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {sendDate ? format(sendDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={sendDate}
                              onSelect={setSendDate}
                              locale={enUS}
                              className="border-none"
                              classNames={{
                                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                month: "space-y-4",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute",
                                nav_button_previous: "left-1",
                                nav_button_next: "right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground",
                                day_outside: "text-muted-foreground opacity-50",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recurring">Recurring Campaign</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="recurring"
                            checked={isRecurring}
                            onCheckedChange={setIsRecurring}
                          />
                          <Label htmlFor="recurring">Enable recurring schedule</Label>
                        </div>
                      </div>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="content">
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="emailTemplate">Email Template</Label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                        <SelectTrigger id="emailTemplate">
                          <SelectValue placeholder="Select email template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  </form>
                </TabsContent>
                <TabsContent value="audience">
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Select value={targetAudience} onValueChange={setTargetAudience}>
                        <SelectTrigger id="targetAudience">
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subscribers</SelectItem>
                          <SelectItem value="new">New Subscribers</SelectItem>
                          <SelectItem value="active">Active Users</SelectItem>
                          <SelectItem value="inactive">Inactive Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audienceFile">Upload Audience File (CSV)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="audienceFile"
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="flex-grow"
                        />
                        <Button variant="outline" onClick={() => document.getElementById('audienceFile')?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                      {audienceFile && (
                        <p className="text-sm text-gray-500 mt-1">
                          File selected: {audienceFile.name} ({csvData.length} recipients)
                        </p>
                      )}
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
              <div className="flex justify-between mt-8">
                {activeTab !== 'details' && (
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {activeTab === 'audience' ? (
                  <Button onClick={handleSaveCampaign} className="bg-purple-600 hover:bg-purple-700 text-white ml-auto">
                    Schedule Campaign
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white ml-auto">
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      <SuccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />
    </div>
  )
}