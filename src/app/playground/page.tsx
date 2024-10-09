"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { Send, Loader2, Calendar, X, Sparkles } from 'lucide-react'
import { handleUserInput } from '@/functionCalling/functionHandler'
import * as PlaygroundUI from '@/components/PlaygroundUI'
import { format } from 'date-fns'

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

export default function Playground() {
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
      }
    } catch (error) {
      console.error('Error handling user input:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    }

    setIsLoading(false)
  }

  const handleCampaignInput = (field: keyof CampaignData, value: any) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
    let nextPrompt = '';
    let nextStep = currentStep + 1;

    switch (field) {
      case 'name':
        nextPrompt = `Great! Your campaign name is "${value}". Now, let's choose a template for your campaign. Which type of template would you like to use?`;
        break;
      case 'template':
        const template = value as EmailTemplate;
        setCampaignData(prev => ({
          ...prev,
          subject: template.subject,
          body: template.body
        }));
        nextPrompt = `Excellent choice! I've selected the "${template.name}" template for you. Here's a preview of the subject and body:

Subject: ${template.subject}

Body: ${template.body}

Would you like to make any changes to this template?`;
        break;
      case 'type':
        nextPrompt = `Excellent choice. For the "${campaignData.name}" ${value} campaign, what's the subject line?`;
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
      { role: 'user', content: String(value) },
      { role: 'assistant', content: nextPrompt }
    ]);
    setCurrentStep(nextStep);
  }

  const handleInputSubmit = (field: keyof CampaignData) => {
    const value = campaignData[field];
    let nextPrompt = '';
    let nextStep = currentStep + 1;

    switch (field) {
      case 'name':
        nextPrompt = `Great! Your campaign name is "${value}". Now, let's choose a template for your campaign. Which type of template would you like to use?`;
        break;
      case 'template':
        const template = campaignData.template;
        if (template) {
          setCampaignData(prev => ({
            ...prev,
            subject: template.subject,
            body: template.body
          }));
          nextPrompt = `Excellent choice! I've selected the "${template.name}" template for you. Here's a preview of the subject and body:

Subject: ${template.subject}

Body: ${template.body}

Would you like to make any changes to this template?`;
        } else {
          nextPrompt = "I'm sorry, but I couldn't find that template. Let's try selecting a template again.";
          nextStep = currentStep;
        }
        break;
      case 'subject':
        nextPrompt = "Great! Now, let's review the email body. Would you like to make any changes?";
        break;
      case 'body':
        nextPrompt = "Perfect! Now, let's upload a CSV file with your recipient list.";
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
    setMessages(prev => [...prev, 
      { role: 'assistant', content: "I've cancelled the current action. What else can I help you with?" }
    ])
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCampaignInput('name', input)}
            />
            <Button onClick={() => handleCampaignInput('name', input)}>Next</Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-2">
            <Label>Email Template</Label>
            <Select 
              value={campaignData.template?.id} 
              onValueChange={(value) => {
                const template = getTemplateById(value);
                if (template) {
                  handleCampaignInput('template', template);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 3:
        return (
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input 
              value={campaignData.subject}
              onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
              onBlur={() => handleCampaignInput('subject', campaignData.subject)}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-2">
            <Label>Email Body</Label>
            <Textarea 
              value={campaignData.body}
              onChange={(e) => setCampaignData(prev => ({ ...prev, body: e.target.value }))}
              onBlur={() => handleCampaignInput('body', campaignData.body)}
              rows={5}
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-2">
            <FileUpload label="Upload CSV" accept=".csv" onChange={handleFileUpload} />
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <Button onClick={() => handleScheduleCampaign('now')}>Send Now</Button>
            <Button onClick={() => handleScheduleCampaign('tomorrow')}>Tomorrow at 10:00 AM</Button>
            <Button onClick={() => handleScheduleCampaign('in2days')}>In 2 days at 10:00 AM</Button>
            <Button onClick={() => handleScheduleCampaign('custom')}>Custom Date & Time</Button>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="customDate">Date</Label>
                <PlaygroundUI.DatePicker 
                  value={campaignData.scheduledDateTime} 
                  onChange={(date) => setCampaignData(prev => ({ ...prev, scheduledDateTime: date }))} 
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="customTime">Time</Label>
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
            </div>
            <Button onClick={handleCustomDateTimeSubmit}>Confirm Schedule</Button>
            <Button variant="outline" onClick={() => setCurrentStep(6)}>Back</Button>
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
          toggleDarkMode={() => setDarkMode(!darkMode)}
          isMobileMenuOpen={false}
          setIsMobileMenuOpen={() => {}}
          className="hidden lg:block"
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 lg:px-12">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">AI Campaign Assistant</h1>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <p className={message.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}>
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {renderCurrentStep()}

                {currentStep === 0 && (
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about email campaigns..."
                        className="pr-12 py-3 text-lg"
                        onBlur={handleSubmit}
                      />
                      <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="absolute right-1 top-1 bottom-1"
                      >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </Button>
                    </div>
                  </form>
                )}

                {currentAction && (
                  <Button onClick={handleCancel} className="mt-4" variant="destructive">
                    <X className="mr-2 h-4 w-4" /> Cancel Current Action
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}