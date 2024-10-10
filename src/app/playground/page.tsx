"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from '@/components/Sidebar'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FileUpload from "@/components/ui/file-upload"
import { createCampaign } from '@/utils/campaignManager'
import { checkAndSendScheduledCampaigns } from '@/utils/scheduledCampaignManager'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { emailTemplates, getTemplateById, EmailTemplate } from '@/utils/emailTemplates'
import { Send, Loader2, Calendar, X, Sparkles, Search, Bell, Moon, Sun, Menu } from 'lucide-react'
import { handleUserInput } from '@/functionCalling/functionHandler'
import * as PlaygroundUI from '@/components/PlaygroundUI'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitialsFromEmail } from '@/utils/stringUtils'
import { motion, AnimatePresence } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface CampaignData {
  name: string
  type: string
  subject: string
  body: string
  recipients: { name: string; email: string }[]
  isScheduled: boolean
  scheduledDateTime?: Date
  template: EmailTemplate | null
}

export default function EnhancedEmailCampaignGenerator() {
  const [darkMode, setDarkMode] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI assistant for email campaigns. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    type: '',
    subject: '',
    body: '',
    recipients: [],
    isScheduled: false,
    template: null
  })
  const [currentStep, setCurrentStep] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; picture: string } | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      checkAndSendScheduledCampaigns();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

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

    fetchUserInfo();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await handleUserInput(input)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      
      if (response.includes("Let's create a new campaign")) {
        setCurrentAction('createCampaign')
        setCurrentStep(1)
        setIsFormVisible(true)
      }
    } catch (error) {
      console.error('Error handling user input:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    }

    setIsLoading(false)
  }

  const handleCampaignInput = (field: keyof CampaignData) => {
    setCampaignData(prev => ({ ...prev, [field]: input }));
    let nextPrompt = '';
    let nextStep = currentStep + 1;

    switch (field) {
      case 'name':
        nextPrompt = `Great! Your campaign name is "${input}". Now, what type of campaign is this? (e.g., newsletter, promotional, transactional)`;
        break;
      case 'type':
        nextPrompt = `Excellent choice. For the "${campaignData.name}" ${input} campaign, what's the subject line?`;
        break;
      case 'subject':
        nextPrompt = `Perfect subject line. Now, let's craft the body of your email. What message would you like to convey?`;
        break;
      case 'body':
        nextPrompt = `Great content! Would you like to upload a CSV file with recipient information now?`;
        break;
      default:
        nextPrompt = "Is there anything else you'd like to add to your campaign?";
        nextStep = currentStep;
    }

    setMessages(prev => [...prev, 
      { role: 'user', content: input },
      { role: 'assistant', content: nextPrompt }
    ]);
    setCurrentStep(nextStep);
    setInput(''); // Clear input after processing
  }

  const handleInputSubmit = (field: keyof CampaignData) => {
    const value = campaignData[field];
    let nextPrompt = '';
    let nextStep = currentStep + 1;

    switch (field) {
      case 'name':
        nextPrompt = `Great! Your campaign name is "${value}". Now, let's choose the type of campaign. What type of campaign would you like to create?`;
        break;
      case 'type':
        const template = emailTemplates.find(t => t.id === value);
        if (template) {
          setCampaignData(prev => ({
            ...prev,
            subject: template.subject,
            body: template.body,
            template: template
          }));
          nextPrompt = `Excellent choice. I've selected the "${template.name}" template for your "${campaignData.name}" campaign. Here's a preview of the subject and body:

Subject: ${template.subject}

Body: ${template.body}

Would you like to make any changes to this template?`;
        } else {
          nextPrompt = `Excellent choice. For the "${campaignData.name}" ${value} campaign, what's the subject line?`;
        }
        break;
      case 'subject':
        nextPrompt = "Great! Now, let's craft the body of your email. What message would you like to convey?";
        break;
      case 'body':
        nextPrompt = "Perfect! Now, let's upload a CSV file with your recipient list.";
        break;
      case 'recipients':
        nextPrompt = "Great! Your recipient list has been uploaded. Would you like to schedule this campaign or send it right away?";
        break;
      default:
        nextPrompt = "What would you like to do next?";
        nextStep = currentStep;
    }

    setMessages(prev => [...prev, 
      { role: 'user', content: String(value) },
      { role: 'assistant', content: nextPrompt }
    ]);
    setCurrentStep(nextStep);
  }

  const handleFileUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const lines = content.split('\n')
        const recipients = lines.map(line => {
          const [name, email] = line.split(',')
          return { name: name.trim(), email: email.trim() }
        })
        setCampaignData(prev => ({ ...prev, recipients }))
      }
      reader.readAsText(file)
    }

    setMessages(prev => [...prev, 
      { role: 'user', content: file ? `Uploaded ${file.name}` : 'No file uploaded' },
      { role: 'assistant', content: "Great! I've processed your recipient list. Your campaign is now ready to go. Would you like to schedule it for later or send it right away?" }
    ])
    setCurrentStep(6)
  }

  const handleScheduleCampaign = async (scheduleType: 'now' | 'tomorrow' | 'in2days' | 'custom') => {
    let scheduledDateTime: Date | undefined;
    switch (scheduleType) {
      case 'now':
        scheduledDateTime = new Date();
        break;
      case 'tomorrow':
        scheduledDateTime = new Date();
        scheduledDateTime.setDate(scheduledDateTime.getDate() + 1);
        scheduledDateTime.setHours(10, 0, 0, 0);
        break;
      case 'in2days':
        scheduledDateTime = new Date();
        scheduledDateTime.setDate(scheduledDateTime.getDate() + 2);
        scheduledDateTime.setHours(10, 0, 0, 0);
        break;
      case 'custom':
        setCurrentStep(7); // Move to custom date/time selection step
        return; // Exit the function early
    }

    if (scheduledDateTime) {
      await saveCampaign(scheduledDateTime);
    }
  }

  const handleCustomDateTimeSubmit = async () => {
    if (campaignData.scheduledDateTime) {
      await saveCampaign(campaignData.scheduledDateTime);
    } else {
      setMessages(prev => [...prev, 
        { role: 'assistant', content: "Please select both a date and time before scheduling." }
      ]);
    }
  }

  const saveCampaign = async (scheduledDateTime?: Date) => {
    try {
      const tokens = JSON.parse(localStorage.getItem('gmail_tokens') || '{}')
      const userEmail = localStorage.getItem('user_email') || ''

      const newCampaign = await createCampaign({
        ...campaignData,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isRecurring: false,
        targetAudience: 'all',
        userEmail,
        tokens,
        isScheduled: !!scheduledDateTime,
        scheduledDateTime: scheduledDateTime?.toISOString(),
      })

      setMessages(prev => [...prev, 
        { role: 'assistant', content: scheduledDateTime
          ? `Great! Your campaign "${newCampaign.name}" has been scheduled for ${scheduledDateTime.toLocaleString()}. Is there anything else I can help you with?`
          : `Excellent! Your campaign "${newCampaign.name}" has been created and will be sent shortly. Is there anything else you'd like to do?`
        }
      ])
      setCurrentStep(0)
      setCurrentAction(null)
      setIsFormVisible(false)
    } catch (error) {
      console.error('Error saving campaign:', error)
      setMessages(prev => [...prev, 
        { role: 'assistant', content: `I'm sorry, but there was an error creating the campaign: ${error instanceof Error ? error.message : 'Unknown error'}. Can I help you troubleshoot or try again?` }
      ])
    }
  }

  const handleCancel = () => {
    setCurrentAction(null)
    setCurrentStep(0)
    setCampaignData({
      name: '',
      type: '',
      subject: '',
      body: '',
      recipients: [],
      isScheduled: false,
      template: null
    })
    setIsFormVisible(false)
    setMessages(prev => [...prev, 
      { role: 'assistant', content: "I've cancelled the current action. What else can I help you with?" }
    ])
  }

  const renderCurrentStep = () => {
    const renderButtons = (onNext: () => void) => (
      <div className="flex space-x-4 mt-4">
        <Button 
          onClick={onNext}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Next
        </Button>
        <Button 
          onClick={handleCancel}
          className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Cancel
        </Button>
      </div>
    );

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 w-full max-w-md mx-auto">
            <PlaygroundUI.CampaignNameInput 
              value={campaignData.name}
              onChange={(value) => setCampaignData(prev => ({ ...prev, name: value }))}
            />
            {renderButtons(() => handleInputSubmit('name'))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 w-full max-w-md mx-auto">
            <PlaygroundUI.CampaignTypeSelect
              value={campaignData.type}
              onChange={(value) => {
                setCampaignData(prev => ({ ...prev, type: value }));
                handleInputSubmit('type');
              }}
              options={emailTemplates.map(template => ({
                value: template.id,
                label: template.name
              }))}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 w-full max-w-md mx-auto">
            <PlaygroundUI.SubjectInput
              value={campaignData.subject}
              onChange={(value) => setCampaignData(prev => ({ ...prev, subject: value }))}
            />
            {renderButtons(() => handleInputSubmit('subject'))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 w-full max-w-2xl mx-auto">
            <PlaygroundUI.BodyTextarea
              value={campaignData.body}
              onChange={(value) => setCampaignData(prev => ({ ...prev, body: value }))}
            />
            {renderButtons(() => handleInputSubmit('body'))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 w-full max-w-md mx-auto">
            <PlaygroundUI.RecipientFileUpload onChange={handleFileUpload} />
            {renderButtons(() => handleInputSubmit('recipients'))}
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 w-full max-w-md mx-auto">
            <Button onClick={() => handleScheduleCampaign('now')} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">Send Now</Button>
            <Button onClick={() => handleScheduleCampaign('tomorrow')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200">Tomorrow at 10:00 AM</Button>
            <Button onClick={() => handleScheduleCampaign('in2days')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200">In 2 days at 10:00 AM</Button>
            <Button onClick={() => handleScheduleCampaign('custom')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">Custom Date & Time</Button>
            {renderButtons(handleCancel)}
          </div>
        );
      case 7:
        return (
          <div className="space-y-4 w-full max-w-md mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlaygroundUI.DatePicker 
                value={campaignData.scheduledDateTime} 
                onChange={(date) => setCampaignData(prev => ({ ...prev, scheduledDateTime: date }))} 
              />
              <PlaygroundUI.TimePicker 
                value={campaignData.scheduledDateTime && !isNaN(campaignData.scheduledDateTime.getTime()) 
                  ? format(campaignData.scheduledDateTime, 'HH:mm') 
                  : '10:00'
                } 
                onChange={(time) => {
                  const [hours, minutes] = time.split(':').map(Number);
                  const newDate = new Date(campaignData.scheduledDateTime || new Date());
                  newDate.setHours(hours, minutes);
                  setCampaignData(prev => ({ ...prev, scheduledDateTime: newDate }));
                }} 
              />
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleCustomDateTimeSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200">Confirm Schedule</Button>
              <Button onClick={handleCancel} className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200">Cancel</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>

    <div className="flex flex-1 overflow-hidden">
      <Sidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        className="hidden lg:block"
      />
     
        
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">AI Campaign Assistant</h1>
          <div className="flex items-center space-x-4">
            <div className="relative w-full lg:w-96 hidden lg:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter by name or description..." className="pl-8 w-full" />
            </div>
            <Button variant="ghost" size="icon" className="hidden lg:inline-flex">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
            
            <div className="flex-1 flex flex-col overflow-hidden  text-foreground rounded-lg">
              <div className="flex-1 flex flex-col  p-6 space-y-6">
                <div className="flex-1 overflow-y-auto  space-y-4 pr-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--scrollbar) var(--scrollbar-bg)' }}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background text-muted-foreground'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex justify-start">
                <div className="flex-2 w-[500px] justify-start space-y-6">                <AnimatePresence>
                  {isFormVisible && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderCurrentStep()}
                    </motion.div>
                  )}
                </AnimatePresence>

                {currentStep === 0 && (
                  <form onSubmit={handleSubmit} className="mt-auto">
                    <div className="relative">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about email campaigns..."
                        className="pr-12 py-3 text-sm min-h-[100px] resize-none bg-background border-input focus:border-ring focus:ring-ring rounded-lg w-full"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                      <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="absolute right-2 bottom-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 transition-colors duration-200"
                      >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </Button>
                    </div>
                  </form>
                )}
                </div>
                </div>
              
              </div>
            </div>
          </div>
        </main>
      </div>

    
    </div>
  )
}