"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Moon, Bell, ChevronDown, LayoutDashboard, Mail, Users, Settings, MoreVertical, Calendar as CalendarIcon, Upload, Sparkles, Sun, ChevronLeft, ChevronRight, Menu, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO, startOfDay } from 'date-fns'
import { toZonedTime, format as formatTZ } from 'date-fns-tz'
import { enUS } from "date-fns/locale"
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import SuccessModal from '@/components/SuccessModal'
import { getInitialsFromEmail } from '@/utils/stringUtils';
import { createCampaign } from '@/utils/db'
import { CampaignData, TemplateData } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { checkAndSendScheduledCampaigns } from '@/utils/scheduledCampaignManager';
import { emailTemplates, getTemplateById, EmailTemplate } from '@/utils/emailTemplates'
import dynamic from 'next/dynamic'
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // You can choose a different style if you prefer
import DOMPurify from 'dompurify'
import { CampaignType } from '@/types/database';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'
import { getTemplates } from '@/utils/db';  // Add this import



export default function CreateCampaign() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [tokens, setTokens] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [campaignType, setCampaignType] = useState<CampaignType>('general');
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [targetAudience, setTargetAudience] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [audienceFile, setAudienceFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState('details')
  const [csvData, setCsvData] = useState<{ name: string; email: string }[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [trackingIds, setTrackingIds] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; picture: string } | null>(null);
  
  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [scheduledTime, setScheduledTime] = useState<string>('12:00')
  const [previewHtml, setPreviewHtml] = useState('');
  const { user } = useAuth()
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  const [customTemplates, setCustomTemplates] = useState<TemplateData[]>([]);

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

  useEffect(() => {
    const fetchUserInfo = async () => {
      const storedTokens = localStorage.getItem('gmail_tokens');
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        try {
          const response = await fetch('https://superemailapp-backend.onrender.com/auth/user-info', {
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

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Running scheduled check...');
      checkAndSendScheduledCampaigns();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (campaignType) {
      const template = getTemplateById(campaignType);
      if (template) {
        setSelectedTemplate(template);
        setSubject(template.subject);
        setBody(template.body);
      }
    }
  }, [campaignType]);

  useEffect(() => {
    // Initialize highlight.js
    hljs.highlightAll();
  }, []);

  useEffect(() => {
    if (campaignType === 'newsletter') {  // Changed from 'go-green' to 'newsletter'
      const template = getTemplateById('newsletter-template');
      if (template) {
        setSubject(template.subject);
        setBody(template.body);
      }
    }
  }, [campaignType]);

  useEffect(() => {
    setPreviewHtml(body);
  }, [body]);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!user) return;
      try {
        const userTemplates = await getTemplates(user.id);
        setTemplates(userTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  }, [user]);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!user) return;
      try {
        const userTemplates = await getTemplates(user.id);
        setCustomTemplates(userTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  }, [user]);

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'none') {
      setSelectedTemplate(null);
      setSubject('');
      setBody('');
      return;
    }

    // Check predefined templates
    const predefinedTemplate = emailTemplates.find(t => t.id === templateId);
    if (predefinedTemplate) {
      setSelectedTemplate(predefinedTemplate);
      setSubject(predefinedTemplate.subject);
      setBody(predefinedTemplate.body);
      // Set campaign type based on template
      switch (templateId) {
        case 'welcome-new':
          setCampaignType('newsletter');
          break;
        case 'testimonials':
          setCampaignType('promotional');
          break;
        case 'survey':
          setCampaignType('transactional');
          break;
        default:
          setCampaignType('general');
      }
      return;
    }

    // Check custom templates
    const customTemplate = customTemplates.find(t => t.id === templateId);
    if (customTemplate) {
      setSubject(customTemplate.subject);
      setBody(customTemplate.body);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleSaveCampaign = async () => {
    if (!user) {
      setModalMessage('You must be authenticated to create a campaign.')
      setIsModalOpen(true)
      return
    }

    // Add validation for endDate
    if (!endDate) {
      setModalMessage('Please select an end date for the campaign.')
      setIsModalOpen(true)
      return
    }

    try {
      let scheduledDateTime: string | undefined
      if (isScheduled && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number)
        const scheduledDateTimeObj = new Date(scheduledDate)
        scheduledDateTimeObj.setHours(hours, minutes, 0, 0)
        scheduledDateTime = scheduledDateTimeObj.toISOString()
      }

      const campaignData: CampaignData = {
        id: Date.now().toString(),
        userId: user.id,
        name: campaignName,
        type: campaignType,
        subject,
        body,
        recipients: csvData,
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(), // Now we know endDate is defined
        isRecurring,
        isScheduled,
        scheduledDateTime,
        status: isScheduled ? 'scheduled' : 'running',
        stats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0
        },
        trackingIds: [],
        targetAudience: targetAudience,
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const newCampaign = await createCampaign(campaignData)

      setModalMessage(isScheduled && scheduledDateTime
        ? `Campaign "${campaignName}" scheduled for ${new Date(scheduledDateTime).toLocaleString()}.`
        : `Campaign "${campaignName}" created successfully!`
      )
      setIsModalOpen(true)

      // Keep existing email sending functionality
      if (!isScheduled) {
        // Your existing email sending logic
      }

    } catch (error) {
      console.error('Error saving campaign:', error)
      setModalMessage(`Error creating campaign: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsModalOpen(true)
    }
  };

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

  const handleDateSelect = (date: Date | undefined, dateType: 'end' | 'scheduled') => {
    if (dateType === 'end') {
      setEndDate(date);
    } else {
      setScheduledDate(date);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div> // Or a more sophisticated loading state
  }

  // Use local time for today's date
  const today = startOfDay(new Date());

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }

  const sanitizeHtml = (html: string) => {
    return {
      __html: DOMPurify.sanitize(html)
    };
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold dark:text-white">Create Campaign</h1>
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Campaign</h1>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon">
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Campaign Details</CardTitle>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details" onClick={() => setActiveTab('details')}>Details</TabsTrigger>
                    <TabsTrigger value="content" onClick={() => setActiveTab('content')}>Content</TabsTrigger>
                    <TabsTrigger value="audience" onClick={() => setActiveTab('audience')}>Audience</TabsTrigger>
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
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="template">Template Selection</Label>
                          <Select
                            value={selectedTemplate?.id || 'none'}
                            onValueChange={handleTemplateSelect}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Template</SelectItem>
                              
                              {/* Predefined Templates */}
                              <SelectItem value="welcome-new">Welcome Email</SelectItem>
                              <SelectItem value="testimonials">Testimonials Email</SelectItem>
                              <SelectItem value="survey">Survey Request</SelectItem>
                              <SelectItem value="event-invitation">Event Invitation</SelectItem>
                              <SelectItem value="thank-you">Thank You Email</SelectItem>
                              <SelectItem value="go-green">Go Green Initiative</SelectItem>
                              
                              {/* Separator for Custom Templates */}
                              {customTemplates.length > 0 && (
                                <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                                  Your Custom Templates
                                </div>
                              )}
                              
                              {/* Custom Templates */}
                              {customTemplates.map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="campaignType">Campaign Type</Label>
                          <Select
                            value={campaignType}
                            onValueChange={(value: CampaignType) => setCampaignType(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select campaign type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Campaign</SelectItem>
                              <SelectItem value="newsletter">Newsletter Campaign</SelectItem>
                              <SelectItem value="promotional">Promotional Campaign</SelectItem>
                              <SelectItem value="transactional">Transactional Campaign</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => handleDateSelect(date, 'end')}
                                disabled={(date) => date < today}
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
                        <div className="space-y-2">
                          <Label htmlFor="isScheduled">Schedule Campaign</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isScheduled"
                              checked={isScheduled}
                              onCheckedChange={setIsScheduled}
                            />
                            <Label htmlFor="isScheduled">Enable scheduling</Label>
                          </div>
                        </div>
                        
                        {isScheduled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="scheduledDate">Scheduled Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${!scheduledDate && "text-muted-foreground"}`}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={scheduledDate}
                                    onSelect={(date) => {
                                      setScheduledDate(date);
                                      console.log('Selected date:', date); // Debug log
                                    }}
                                    disabled={(date) => date < today}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="scheduledTime">Scheduled Time</Label>
                              <Input
                                id="scheduledTime"
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => {
                                  setScheduledTime(e.target.value);
                                  console.log('Selected time:', e.target.value); // Debug log
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </form>
                  </TabsContent>
                  <TabsContent value="content">
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Enter email subject"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="body">Body</Label>
                        <ReactQuill
                          value={body}
                          onChange={setBody}
                          modules={modules}
                          theme="snow"
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
                      Create Campaign
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white ml-auto">
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <SuccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />
      
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
