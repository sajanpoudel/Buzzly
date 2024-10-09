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

interface Message {
  role: 'user' | 'assistant'
  content: string
  isLoading?: boolean
}

interface CampaignData {
  name: string
  type: string
  audience: string
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
    { role: 'assistant', content: "Hello! I'm your AI assistant for creating email campaigns. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    type: '',
    audience: 'all users',
    subject: '',
    body: '',
    recipients: [],
    isScheduled: false,
    scheduledDateTime: undefined,
    template: null
  })
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
      if (input.toLowerCase().includes('create a campaign')) {
        setCurrentStep(1)
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Great! I'd be happy to help you create a campaign. Let's start with the basics. What would you like to name your campaign?" 
        }])
      } else {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        const result = await model.generateContent(input)
        const response = await result.response
        const text = response.text()
        setMessages(prev => [...prev, { role: 'assistant', content: text }])
      }
    } catch (error) {
      console.error('Error generating response:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    }

    setIsLoading(false)
  }

  const handleCampaignInput = (field: keyof CampaignData, value: string) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
    let nextPrompt = '';
    let nextStep = currentStep + 1;

    switch (field) {
      case 'name':
        nextPrompt = `Great! Your campaign name is "${value}". Now, what type of campaign is this? (e.g., newsletter, promotional, transactional)`;
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
      { role: 'user', content: value },
      { role: 'assistant', content: nextPrompt }
    ]);
    setCurrentStep(nextStep);
    setInput(''); // Clear input after each step
  }

  const handleScheduleCampaign = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem('gmail_tokens') || '{}')
      const userEmail = localStorage.getItem('user_email') || ''

      const newCampaign = await createCampaign({
        ...campaignData,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isRecurring: false,
        targetAudience: campaignData.audience,
        userEmail,
        tokens,
        isScheduled: true,
        scheduledDateTime: campaignData.scheduledDateTime?.toISOString(),
      })

      setMessages(prev => [...prev, 
        { role: 'assistant', content: `Great news! Your campaign "${newCampaign.name}" has been scheduled for ${new Date(newCampaign.scheduledDateTime!).toLocaleString()}. Is there anything else I can help you with?` }
      ])
      setCurrentStep(0)
    } catch (error) {
      console.error('Error scheduling campaign:', error)
      setMessages(prev => [...prev, 
        { role: 'assistant', content: 'I apologize, but there was an error scheduling the campaign. Can you please try again or let me know if you need help troubleshooting?' }
      ])
    }
  }

  const handleSendNow = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem('gmail_tokens') || '{}')
      const userEmail = localStorage.getItem('user_email') || ''

      const newCampaign = await createCampaign({
        ...campaignData,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isRecurring: false,
        targetAudience: campaignData.audience,
        userEmail,
        tokens,
        isScheduled: false,
        scheduledDateTime: undefined,
      })

      setMessages(prev => [...prev, 
        { role: 'assistant', content: `Excellent! Your campaign "${newCampaign.name}" has been sent successfully. ${newCampaign.stats.sent} emails were delivered. Is there anything else you'd like to do?` }
      ])
      setCurrentStep(0)
    } catch (error) {
      console.error('Error sending campaign:', error)
      setMessages(prev => [...prev, 
        { role: 'assistant', content: `I'm sorry, but there was an error sending the campaign: ${error instanceof Error ? error.message : 'Unknown error'}. Can I help you troubleshoot or try again?` }
      ])
    }
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

  const handleDateChange = (date: Date | null) => {
    setCampaignData(prev => ({ ...prev, scheduledDateTime: date || undefined }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input 
              placeholder="Enter campaign name"
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
            <Label>Campaign Type</Label>
            <Select onValueChange={(value) => handleCampaignInput('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select campaign type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="transactional">Transactional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 3:
        return (
          <div className="space-y-2">
            <Label>Subject Line</Label>
            <Input 
              placeholder="Enter subject line"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCampaignInput('subject', input)}
            />
            <Button onClick={() => handleCampaignInput('subject', input)}>Next</Button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-2">
            <Label>Email Body</Label>
            <Textarea 
              placeholder="Enter email body"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
            />
            <Button onClick={() => handleCampaignInput('body', input)}>Next</Button>
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
          <div className="space-y-2">
            <Button onClick={() => setCurrentStep(7)}>Schedule</Button>
            <Button onClick={handleSendNow}>Send Now</Button>
          </div>
        );
      case 7:
        return (
          <div className="space-y-2">
            <DatePicker
              selected={campaignData.scheduledDateTime}
              onChange={handleDateChange}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              className="w-full p-2 border rounded"
            />
            <Button onClick={handleScheduleCampaign}>Confirm Schedule</Button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
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
                      {message.isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      ) : (
                        <p className={message.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}>
                          {message.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {currentStep === 0 ? (
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about email campaigns..."
                      className="pr-12 py-3 text-lg"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="absolute right-1 top-1 bottom-1"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              ) : (
                <Card className="mt-4">
                  <CardContent className="p-6">
                    {renderCurrentStep()}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Powered by AI - Create amazing email campaigns with ease
              </p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setCurrentStep(0)}
                className="mt-2"
              >
                <Sparkles className="h-4 w-4 mr-2" /> Start a new campaign
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}