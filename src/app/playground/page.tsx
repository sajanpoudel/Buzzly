"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from '@/components/Sidebar'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FileUpload from "@/components/ui/file-upload"
import { createCampaign } from '@/utils/campaignManager'
import { checkAndSendScheduledCampaigns } from '@/utils/scheduledCampaignManager'
import { emailTemplates, getTemplateById, EmailTemplate } from '@/utils/emailTemplates'
import { Send, Loader2, Calendar, X, Sparkles, Search, Bell, Moon, Sun, Menu, Pencil } from 'lucide-react'
import { handleUserInput } from '@/functionCalling/functionHandler'
import * as PlaygroundUI from '@/components/PlaygroundUI'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitialsFromEmail } from '@/utils/stringUtils'
import { motion, AnimatePresence } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { handleKeyboardShortcut, SHORTCUTS } from '@/utils/keyboardShortcuts'
import { generateTemplate, saveTemplate } from '@/functionCalling/templateFunctions'
import { Switch } from "@/components/ui/switch"
import { CampaignCreationData } from '@/types/campaign'
import { SendPaymentForm, PaymentData } from '@/components/SendPaymentForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import Image from 'next/image'
import Papa from 'papaparse'
import dynamic from 'next/dynamic'
import DOMPurify from 'dompurify'
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

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
  isSingleEmail?: boolean
  description?: string  // Add this line
}

interface TemplateData {
  name: string
  description: string
  subject: string
  body: string
}

interface EmailData {
  template: EmailTemplate | null
  subject: string
  body: string
  recipients: { name: string; email: string }[]
  scheduledDateTime?: Date
}

const InfinityLoader = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.1,8.3c1.5-1.5,3.9-1.5,5.4,0c1.5,1.5,1.5,3.9,0,5.4l-2.7,2.7c-1.5,1.5-3.9,1.5-5.4,0c-0.7-0.7-1.1-1.7-1.1-2.7
      s0.4-2,1.1-2.7l2.7-2.7z M10.9,15.7c-1.5,1.5-3.9,1.5-5.4,0c-1.5-1.5-1.5-3.9,0-5.4l2.7-2.7c1.5-1.5,3.9-1.5,5.4,0
      c0.7,0.7,1.1,1.7,1.1,2.7s-0.4,2-1.1,2.7l-2.7,2.7z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <animate
        attributeName="stroke"
        values="#87CEEB;#4682B4;#1E90FF;#87CEEB"
        dur="4s"
        repeatCount="indefinite"
      />
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="4s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const StatusUpdate = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex items-center space-x-2 text-sm text-muted-foreground"
  >
    <InfinityLoader />
    <span>{message}</span>
  </motion.div>
);

const RightPanel = ({ 
  isCreatingCampaign, 
  isCreatingTemplate, 
  campaignData, 
  templateData, 
  currentStep,
  handleInputSubmit,
  handleTemplateInput,
  handleCancel,
  setCampaignData,
  setTemplateData,
  statusUpdate,
  setStatusUpdate,
  handleScheduleCampaign,
  handleCustomDateTimeSubmit,
  handleFileUpload,
  isCreatingEmail,
  emailData,
  setEmailData,
  handleEmailInput,
  setCurrentStep,
  setInput,
  generateEmailContent,
}: {
  isCreatingCampaign: boolean;
  isCreatingTemplate: boolean;
  campaignData: CampaignData;
  templateData: TemplateData;
  currentStep: number;
  handleInputSubmit: (field: keyof CampaignData) => void;
  handleTemplateInput: (field: keyof TemplateData) => void;
  handleCancel: () => void;
  setCampaignData: React.Dispatch<React.SetStateAction<CampaignData>>;
  setTemplateData: React.Dispatch<React.SetStateAction<TemplateData>>;
  statusUpdate: string | null;
  setStatusUpdate: React.Dispatch<React.SetStateAction<string | null>>;
  handleScheduleCampaign: (scheduleType: 'now' | 'tomorrow' | 'in2days' | 'custom') => void;
  handleCustomDateTimeSubmit: () => void;
  handleFileUpload: (file: File | null) => void;
  isCreatingEmail: boolean;
  emailData: EmailData;
  setEmailData: React.Dispatch<React.SetStateAction<EmailData>>;
  handleEmailInput: (field: keyof EmailData) => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  generateEmailContent: (name: string, description: string) => Promise<void>;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isCreatingCampaign) {
      switch (currentStep) {
        case 1:
          setStatusUpdate("Creating new campaign...");
          break;
        case 2:
          setStatusUpdate("Selecting campaign type...");
          break;
        case 3:
          setStatusUpdate("Crafting email subject...");
          break;
        case 4:
          setStatusUpdate("Composing email body...");
          break;
        case 5:
          setStatusUpdate("Uploading recipient list...");
          break;
        default:
          setStatusUpdate(null);
      }
    } else if (isCreatingTemplate) {
      switch (currentStep) {
        case 1:
          setStatusUpdate("Generating template based on description...");
          break;
        case 2:
          setStatusUpdate("Finalizing template details...");
          break;
        default:
          setStatusUpdate(null);
      }
    } else {
      setStatusUpdate(null);
    }
  }, [currentStep, isCreatingCampaign, isCreatingTemplate]);

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

  const renderForm = () => {
    if (isCreatingCampaign) {
      return (
        <div className="space-y-6">
          {currentStep < 5 && (
            <>
              <PlaygroundUI.CampaignNameInput 
                value={campaignData.name}
                onChange={(value) => {
                  setCampaignData(prev => ({ ...prev, name: value }));
                  setInput(value);
                }}
                onSubmit={() => handleInputSubmit('name')}
              />
              <div className="space-y-2">
                <PlaygroundUI.TemplateDescriptionInput
                  value={campaignData.description || ''}
                  onChange={(value) => setCampaignData(prev => ({ ...prev, description: value }))}
                  onSubmit={() => handleInputSubmit('description')}
                />
                {campaignData.name && campaignData.description && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setIsGenerating(true);
                        generateEmailContent(campaignData.name, campaignData.description || '')
                          .finally(() => setIsGenerating(false));
                      }}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200"
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Campaign'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200"
                      disabled={isGenerating}
                    >
                      Cancel Campaign
                    </Button>
                  </div>
                )}
              </div>
              {isGenerating && (
                <div className="text-sm text-muted-foreground">
                  Crafting your exceptional campaign...
                </div>
              )}
              {campaignData.subject && (
                <PlaygroundUI.SubjectInput
                  value={campaignData.subject}
                  onChange={(value) => setCampaignData(prev => ({ ...prev, subject: value }))}
                  onSubmit={() => handleInputSubmit('subject')}
                />
              )}
              {campaignData.body && (
                <>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="body" className="text-sm font-medium">Email Body</Label>
                    <ReactQuill
                      value={campaignData.body}
                      onChange={(value) => setCampaignData(prev => ({ ...prev, body: value }))}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link'],
                          ['clean']
                        ],
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleInputSubmit('body')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Next: Add Recipients
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Recipients</h3>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with columns for Name and Email.
              </p>
              <PlaygroundUI.RecipientFileUpload onChange={handleFileUpload} />
              {campaignData.recipients.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {campaignData.recipients.length} recipient{campaignData.recipients.length === 1 ? '' : 's'} added
                </p>
              )}
              <div className="flex justify-between mt-4">
                <Button
                  onClick={handleCancel}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Cancel Campaign
                </Button>
                <Button
                  onClick={() => handleInputSubmit('recipients')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={campaignData.recipients.length === 0}
                >
                  Next: Schedule Campaign
                </Button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Schedule Campaign</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleScheduleCampaign('now')}>Send Now</Button>
                <Button onClick={() => handleScheduleCampaign('tomorrow')}>Send Tomorrow</Button>
                <Button onClick={() => handleScheduleCampaign('in2days')}>Send in 2 Days</Button>
                <Button onClick={() => handleScheduleCampaign('custom')}>Custom Schedule</Button>
              </div>
              {campaignData.isScheduled && (
                <div className="space-y-2">
                  <PlaygroundUI.DatePicker 
                    value={campaignData.scheduledDateTime} 
                    onChange={(date) => setCampaignData(prev => ({ ...prev, scheduledDateTime: date }))} 
                  />
                  <PlaygroundUI.TimePicker 
                    value={campaignData.scheduledDateTime ? format(campaignData.scheduledDateTime, 'HH:mm') : '10:00'} 
                    onChange={(time) => {
                      const [hours, minutes] = time.split(':').map(Number);
                      const newDate = new Date(campaignData.scheduledDateTime || new Date());
                      newDate.setHours(hours, minutes);
                      setCampaignData(prev => ({ ...prev, scheduledDateTime: newDate }));
                    }} 
                  />
                  <Button onClick={handleCustomDateTimeSubmit}>Confirm Schedule</Button>
                </div>
              )}
              <Button
                onClick={handleCancel}
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground mt-4"
              >
                Cancel Campaign
              </Button>
            </div>
          )}
        </div>
      );
    } else if (isCreatingTemplate) {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.TemplateDescriptionInput 
                value={templateData.description}
                onChange={(value) => setTemplateData(prev => ({ ...prev, description: value }))}
                onSubmit={() => handleTemplateInput('description')}
              />
              {renderButtons(() => handleTemplateInput('description'))}
            </div>
          );
        case 2:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.SubjectInput
                value={templateData.subject}
                onChange={(value) => setTemplateData(prev => ({ ...prev, subject: value }))}
                onSubmit={() => handleTemplateInput('subject')}
              />
              <PlaygroundUI.BodyTextarea
                value={templateData.body}
                onChange={(value) => setTemplateData(prev => ({ ...prev, body: value }))}
                onSubmit={() => handleTemplateInput('body')}
              />
              <PlaygroundUI.TemplateNameInput
                value={templateData.name}
                onChange={(value) => setTemplateData(prev => ({ ...prev, name: value }))}
                onSubmit={() => handleTemplateInput('name')}
              />
              {renderButtons(() => handleTemplateInput('name'))}
            </div>
          );
      }
    } else if (isCreatingEmail) {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.TemplateSelect
                value={emailData.template?.id || '_scratch'}
                onChange={(value) => {
                  if (value === '_scratch') {
                    setEmailData(prev => ({ ...prev, template: null }));
                  } else {
                    const selectedTemplate = emailTemplates.find(t => t.id === value);
                    setEmailData(prev => ({ ...prev, template: selectedTemplate || null }));
                  }
                  handleEmailInput('template');
                }}
                options={emailTemplates.map(template => ({
                  value: template.id,
                  label: template.name
                }))}
              />
              {renderButtons(() => handleEmailInput('template'))}
            </div>
          );
        case 2:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.SubjectInput
                value={emailData.subject}
                onChange={(value) => setEmailData(prev => ({ ...prev, subject: value }))}
                onSubmit={() => handleEmailInput('subject')}
              />
              {renderButtons(() => handleEmailInput('subject'))}
            </div>
          );
        case 3:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.BodyTextarea
                value={emailData.body}
                onChange={(value) => setEmailData(prev => ({ ...prev, body: value }))}
                onSubmit={() => handleEmailInput('body')}
              />
              {renderButtons(() => handleEmailInput('body'))}
            </div>
          );
        case 4:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.RecipientInput
                recipients={emailData.recipients}
                onAdd={(recipient) => setEmailData(prev => ({ ...prev, recipients: [...prev.recipients, recipient] }))}
                onRemove={(index) => setEmailData(prev => ({ ...prev, recipients: prev.recipients.filter((_, i) => i !== index) }))}
              />
              {renderButtons(() => handleEmailInput('recipients'))}
            </div>
          );
        case 5:
          return (
            <div className="space-y-4 w-full">
              <Button onClick={() => handleEmailInput('scheduledDateTime')} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center">
                <InfinityLoader />
                <span className="ml-2">Send Now</span>
              </Button>
              <Button onClick={() => setCurrentStep(6)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center">
                <InfinityLoader />
                <span className="ml-2">Schedule</span>
              </Button>
            </div>
          );
        case 6:
          return (
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlaygroundUI.DatePicker 
                  value={emailData.scheduledDateTime} 
                  onChange={(date) => setEmailData(prev => ({ ...prev, scheduledDateTime: date }))} 
                />
                <PlaygroundUI.TimePicker 
                  value={emailData.scheduledDateTime ? format(emailData.scheduledDateTime, 'HH:mm') : '10:00'} 
                  onChange={(time) => {
                    const [hours, minutes] = time.split(':').map(Number);
                    const newDate = new Date(emailData.scheduledDateTime || new Date());
                    newDate.setHours(hours, minutes);
                    setEmailData(prev => ({ ...prev, scheduledDateTime: newDate }));
                  }} 
                />
              </div>
              <Button onClick={() => handleEmailInput('scheduledDateTime')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200">Confirm Schedule</Button>
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {isCreatingCampaign ? 'Create Campaign' : isCreatingTemplate ? 'Create Template' : isCreatingEmail ? 'Send Email' : 'Assistant'}
        </h2>
      </div>
      
      {renderForm()}
    </div>
  );
};

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function EnhancedEmailCampaignGenerator({ searchParams = {} }: PageProps) {
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
    template: null,
    description: ''  // Add this line
  })
  const [templateData, setTemplateData] = useState<TemplateData>({
    name: '',
    description: '',
    subject: '',
    body: '',
  });
  const [currentStep, setCurrentStep] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; picture: string } | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<string | null>(null);
  const [isCreatingEmail, setIsCreatingEmail] = useState(false);
  const [emailData, setEmailData] = useState<EmailData>({
    template: null,
    subject: '',
    body: '',
    recipients: [],
    scheduledDateTime: undefined,
  });
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<PaymentData | null>(null);
  const [aiStatus, setAiStatus] = useState('')

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyboardShortcut(event as unknown as React.KeyboardEvent<Element>, {
        'cmd+t': () => {
          if (!isCreatingCampaign && !isCreatingTemplate && !isCreatingEmail) {
            startCampaignCreation();
          }
        },
        'cmd+u': () => {
          if (!isCreatingCampaign && !isCreatingTemplate && !isCreatingEmail) {
            startTemplateCreation();
          }
        },
        'cmd+e': () => {
          if (!isCreatingCampaign && !isCreatingTemplate && !isCreatingEmail) {
            startEmailCreation();
          }
        },
        'cmd+k': () => {
          console.log('Command palette opened');
        },
        'cmd+m': () => {
          if (!isPaymentFormVisible) {
            setIsPaymentFormVisible(true);
            setMessages(prev => [...prev, 
              { role: 'user', content: "I want to send money" },
              { role: 'assistant', content: "Certainly! I've opened the payment form for you. Please fill in the details to send money." }
            ]);
          }
        },
        'esc': handleCancel,
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCreatingCampaign, isCreatingTemplate, isCreatingEmail, isPaymentFormVisible]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const startCampaignCreation = () => {
    setIsCreatingCampaign(true);
    setCurrentAction('createCampaign');
    setCurrentStep(1);
    setIsFormVisible(true);
    setMessages(prev => [...prev, 
      { role: 'user', content: "I want to create a campaign" },
      { role: 'assistant', content: "Certainly! Let's create a new campaign. What would you like to name your campaign?" }
    ]);
  };

  const startTemplateCreation = () => {
    setIsCreatingTemplate(true);
    setCurrentAction('createTemplate');
    setCurrentStep(1);
    setIsFormVisible(true);
    setMessages(prev => [...prev, 
      { role: 'user', content: "I want to create a template" },
      { role: 'assistant', content: "Certainly! Let's create a new email template. Please describe the type of template you want to create." }
    ]);
  };

  const startEmailCreation = () => {
    setIsCreatingEmail(true);
    setCurrentAction('createEmail');
    setCurrentStep(1);
    setIsFormVisible(true);
    setMessages(prev => [...prev, 
      { role: 'user', content: "I want to send an email" },
      { role: 'assistant', content: "Certainly! Let's create a new email. First, would you like to choose a template or start from scratch?" }
    ]);
  };

  const generateEmailContent = async (name: string, description: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const prompt = `Create a concise, formal, and compelling email campaign based on the following:
                      Campaign Name: "${name}"
                      Campaign Description: "${description}"
                      
                      Guidelines:
                      1. Craft a powerful and concise subject line (without any prefix or HTML).
                      2. For the email body, create engaging, personalized, and concise content with the following structure:
                         a. Start directly with a brief, professional greeting (do not include any labels like 'Email Body:')
                         b. A concise introduction (2-3 sentences max)
                         c. 2-3 key points or benefits (as a short, visually appealing bullet list)
                         d. A clear and brief call-to-action
                         e. A formal closing
                      
                      Use appropriate HTML tags for formatting the body, including:
                      - <h1> for the main headline (use sparingly)
                      - <p> for paragraphs
                      - <strong> and <em> for emphasis
                      - <ul> and <li> for bullet points
                      - <a> for the call-to-action button
                      
                      Ensure the tone is formal yet engaging. Make the content concise and impactful.
                      Do not use placeholders like [Name] or [Company]. Instead, use general terms or the actual campaign name.
                      Do not include any labels like 'Subject:' or 'Email Body:' in the generated content.`;
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const generatedText = response.text()

      const [generatedSubject, ...bodyParts] = generatedText.split('\n\n')
      const formattedBody = bodyParts.join('\n\n')
        .replace(/^(email body:|body:|email:)/i, '') // Remove any email body label at the start
        .trim()
        .replace(/^# /gm, '<h1 style="color: #333; font-size: 24px; margin-bottom: 15px;">')
        .replace(/^## /gm, '<h2 style="color: #444; font-size: 20px; margin-bottom: 10px;">')
        .replace(/^### /gm, '<h3 style="color: #555; font-size: 18px; margin-bottom: 8px;">')
        .replace(/\n\n/g, '</p><p style="margin-bottom: 15px; line-height: 1.6;">')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- /gm, '<li style="margin-bottom: 5px;">')
        .replace(/<li>(.+)/g, '<li>$1</li>')
        .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul style="margin-bottom: 15px; padding-left: 20px;">$1</ul>')
        .replace(/\[CTA\](.*?)\[\/CTA\]/g, '<a href="#" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; font-size: 16px; margin: 4px 2px; cursor: pointer; border: none; border-radius: 4px;">$1</a>')

      const finalBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          ${formattedBody}
        </div>
      `

      // Clean the subject: remove any labels, HTML tags, and asterisks
      const cleanedSubject = generatedSubject
        .replace(/subject:|subject line:|email subject:/gi, '')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\*/g, '') // Remove asterisks
        .trim()

      setCampaignData(prev => ({
        ...prev,
        subject: cleanedSubject,
        body: finalBody.trim()
      }))
      setMessages(prev => [...prev, 
        { role: 'assistant', content: "I've crafted a concise and formal email campaign based on your description. The content is tailored to be compelling and engaging. You can now review and edit the subject and body in the form on the right. When you're satisfied, click 'Next' to proceed to the recipient upload step." }
      ]);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error generating email content:', error)
      setMessages(prev => [...prev, 
        { role: 'assistant', content: "I apologize, but there was an error generating the email content. Can you please provide the description again or try rephrasing it?" }
      ]);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')
    setIsLoading(true)

    try {
      if (isCreatingCampaign) {
        await handleCampaignCreation(input)
      } else {
        const response = await handleUserInput(input, {
          startCampaignCreation: () => {
            setIsCreatingCampaign(true)
            setIsFormVisible(true)
            setCurrentStep(1)
            setCampaignData(prev => ({ ...prev, name: input }))
            setMessages(prev => [
              ...prev,
              { role: 'assistant', content: `Great! I've set the campaign name to "${input}". Now, please provide a brief description of the campaign.` }
            ])
          },
          startEmailCreation: () => {
            setIsCreatingEmail(true);
            setIsFormVisible(true);
            setCurrentStep(1);
          },
          openPaymentForm: () => {
            setIsPaymentFormVisible(true);
          },
          startTemplateCreation: () => {
            setIsCreatingTemplate(true);
            setIsFormVisible(true);
            setCurrentStep(1);
          },
        })

        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I encountered an error. Could you please try asking your question in a different way?' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCampaignCreation = async (input: string) => {
    setIsCreatingCampaign(true);
    setIsFormVisible(true);
    setCurrentStep(1);
    setCampaignData(prev => ({ ...prev, name: input }));
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: `Great! I've set the campaign name to "${input}". Now, please provide a brief description of the campaign.` }
    ]);
  }

  const handleFileUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const { data } = Papa.parse(content, { 
          header: true, 
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim()
        });

        // Process recipients and validate emails
        const recipients = data
          .map((row: any) => ({
            name: row.Name || '',
            email: row.Email || ''
          }))
          .filter((recipient: { email: string; name: string }) => 
            recipient.email && 
            recipient.email.includes('@') && 
            recipient.name
          );

        if (recipients.length > 0) {
          // Update campaign data with recipients
          setCampaignData(prev => {
            // Replace [Name] placeholder in email body for preview
            const updatedBody = prev.body.replace(
              /\[Name\]/g, 
              `[Recipient's Name]` // Using a generic placeholder for preview
            );

            return {
              ...prev,
              recipients,
              body: updatedBody
            };
          });

          // Show success message with recipient summary
          const recipientSummary = recipients
            .slice(0, 3)
            .map(r => `- ${r.name} (${r.email})`)
            .join('\n');
          
          const remainingCount = recipients.length > 3 ? recipients.length - 3 : 0;
          const remainingText = remainingCount > 0 ? `\n...and ${remainingCount} more recipients` : '';

          setMessages(prev => [...prev, 
            { 
              role: 'assistant', 
              content: `Great! I've processed your recipient list. ${recipients.length} recipient${recipients.length === 1 ? ' has' : 's have'} been added to your campaign.\n\nRecipient preview:\n${recipientSummary}${remainingText}\n\nThe [Name] placeholder will be automatically replaced with each recipient's name when the email is sent. Would you like to schedule this campaign or send it right away?`
            }
          ]);
          setCurrentStep(6); // Move to scheduling step
        } else {
          // Show error message if no valid recipients found
          setMessages(prev => [...prev, 
            { 
              role: 'assistant', 
              content: "I couldn't find any valid recipients in the CSV file. Please make sure your file has columns named 'Name' and 'Email' with valid information." 
            }
          ]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCancel = () => {
    setCurrentAction(null);
    setCurrentStep(0);
    setCampaignData({
      name: '',
      type: '',
      subject: '',
      body: '',
      recipients: [],
      isScheduled: false,
      template: null
    });
    setEmailData({
      template: null,
      subject: '',
      body: '',
      recipients: [],
      scheduledDateTime: undefined,
    });
    setIsFormVisible(false);
    setIsCreatingCampaign(false);
    setIsCreatingTemplate(false);
    setIsCreatingEmail(false);
    setMessages(prev => [...prev, 
      { role: 'assistant', content: "I've cancelled the current action. What else can I help you with?" }
    ]);
  }

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
    }
  }

  const handlePaymentSubmit = (paymentData: PaymentData) => {
    setPendingPaymentData(paymentData);
    setIsConfirmationDialogOpen(true);
  };

  const confirmAndSendPayment = async () => {
    if (!pendingPaymentData) return;

    try {
      let recipients: { name: string; email: string; amount: number }[] = [];

      if (pendingPaymentData.isMultipleRecipients && pendingPaymentData.csvFile) {
        const csvData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && typeof e.target.result === 'string') {
              resolve(e.target.result);
            } else {
              reject(new Error('Failed to read CSV file'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read CSV file'));
          if (pendingPaymentData.csvFile) {
            reader.readAsText(pendingPaymentData.csvFile);
          } else {
            reject(new Error('CSV file is undefined'));
          }
        });

        const { data } = Papa.parse(csvData, { header: true });
        recipients = data.map((row: any) => ({
          name: row.name || '',
          email: row.email || '',
          amount: parseFloat(row.amount) || 0,
        })).filter(recipient => recipient.email && recipient.amount > 0);
      } else {
        recipients = [{ name: pendingPaymentData.recipient, email: pendingPaymentData.recipient, amount: pendingPaymentData.amount }];
      }

      const results = await Promise.all(recipients.map(async (recipient) => {
        const response = await fetch('/api/send-digital-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: recipient.name,
            email: recipient.email,
            amount: recipient.amount,
            description: pendingPaymentData.description,
            paymentType: pendingPaymentData.paymentType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Payment failed for ${recipient.email}: ${errorData.message}`);
        }

        return response.json();
      }));

      console.log('Payment results:', results);

      const totalAmount = results.reduce((sum, result) => sum + result.result.amount, 0);
      setMessages(prev => [...prev, 
        { role: 'assistant', content: `${pendingPaymentData.paymentType.toUpperCase()} payments sent successfully to ${results.length} recipient(s). Total amount: $${totalAmount.toFixed(2)}` }
      ]);

      setIsPaymentFormVisible(false);
      setIsConfirmationDialogOpen(false);
    } catch (error) {
      console.error('Error sending payment:', error);
      setMessages(prev => [...prev, 
        { role: 'assistant', content: `I'm sorry, but there was an error sending the ${pendingPaymentData.paymentType.toUpperCase()} payment(s): ${error instanceof Error ? error.message : 'Unknown error'}. Can I help you troubleshoot or try again?` }
      ]);
      setIsConfirmationDialogOpen(false);
    }
  };

  const handleInputSubmit = (field: keyof CampaignData) => {
    const value = campaignData[field];
    let nextStep = currentStep;
    let nextPrompt = '';

    switch (field) {
      case 'name':
        setStatusUpdate("Campaign name set. Entering description...");
        nextPrompt = `Great! Your campaign name is "${value}". Now, please provide a brief description of your campaign. Include the purpose, target audience, and any key points you want to highlight.`;
        nextStep = currentStep + 1;
        break;
      case 'description':
        setStatusUpdate("Ready to generate campaign...");
        nextPrompt = "Great! I'm ready to craft an exceptional email campaign based on your name and description. Click 'Generate Campaign' when you're ready to proceed.";
        break;
      case 'subject':
      case 'body':
        setStatusUpdate("Email content updated. Ready to add recipients.");
        nextPrompt = "The email content has been updated. Please upload a CSV file with your recipient information.";
        setCurrentStep(5); // Explicitly set to recipient upload step
        break;
      case 'recipients':
        setStatusUpdate("Recipient list uploaded. Finalizing campaign...");
        nextStep = 6;
        break;
      default:
        nextStep = currentStep;
    }

    setMessages(prev => [...prev, { role: 'assistant', content: nextPrompt }]);
    setInput('');
  };

  const handleTemplateInput = async (field: keyof TemplateData) => {
    const value = templateData[field];
    let nextStep = currentStep + 1;

    switch (field) {
      case 'description':
        if (value.length > 5) {
          try {
            setStatusUpdate("Generating template based on description...");
            const generatedTemplate = await generateTemplate(value);
            setTemplateData(prev => ({
              ...prev,
              subject: generatedTemplate.subject,
              body: generatedTemplate.body,
            }));
            setStatusUpdate("Template generated. Please review and make any necessary changes.");
            nextStep = 2;
          } catch (error) {
            console.error('Error generating template:', error);
            setStatusUpdate("Error generating template. Please try again or enter details manually.");
            nextStep = currentStep;
          }
        } else {
          setStatusUpdate("Please provide a more detailed description (more than 5 characters) to generate a template.");
          nextStep = currentStep;
        }
        break;
      case 'name':
        if (value.trim()) {
          setStatusUpdate("Saving template...");
          await saveTemplate(value, templateData.subject, templateData.body);
          setIsCreatingTemplate(false);
          setCurrentStep(0);
          setIsFormVisible(false);
          setMessages(prev => [...prev, 
            { role: 'assistant', content: `Great! Your template "${value}" has been saved. Is there anything else I can help you with?` }
          ]);
          setTemplateData({
            name: '',
            description: '',
            subject: '',
            body: '',
          });
          return;
        } else {
          setStatusUpdate("Please provide a name for your template before saving.");
          nextStep = currentStep;
        }
        break;
      default:
        break;
    }

    setCurrentStep(nextStep);
  };

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
  };

  const handleCustomDateTimeSubmit = async () => {
    if (campaignData.scheduledDateTime) {
      await saveCampaign(campaignData.scheduledDateTime);
    } else {
      setMessages(prev => [...prev, 
        { role: 'assistant', content: "Please select both a date and time before scheduling." }
      ]);
    }
  };

  const handleEmailInput = async (field: keyof EmailData) => {
    const value = emailData[field];
    let nextStep = currentStep + 1;
    let nextPrompt = '';

    switch (field) {
      case 'template':
        if (value === '_scratch') {
          setEmailData(prev => ({
            ...prev,
            subject: '',
            body: '',
          }));
          setStatusUpdate("Starting from scratch. Please enter the subject.");
        } else if (value) {
          const selectedTemplate = emailTemplates.find(t => t.id === value);
          if (selectedTemplate) {
            setEmailData(prev => ({
              ...prev,
              subject: selectedTemplate.subject,
              body: selectedTemplate.body,
            }));
            setStatusUpdate("Template selected. You can now edit the subject and body.");
          }
        }
        break;
      case 'subject':
        setStatusUpdate("Subject set. Now let's craft the email body.");
        nextPrompt = "Great subject! Now, let's craft the body of your email. What message would you like to convey?";
        break;
      case 'body':
        setStatusUpdate("Email body set. Now, let's add recipients.");
        nextPrompt = "Excellent email body! Now, let's add recipients. Please enter the email addresses separated by commas.";
        break;
      case 'recipients':
        if ((value as { name: string; email: string }[]).length > 1) {
          setStatusUpdate("Multiple recipients added. Would you like to create a campaign instead?");
          // Offer option to create campaign or continue with individual emails
        } else {
          setStatusUpdate("Recipient added. Would you like to schedule this email or send it now?");
        }
        break;
      case 'scheduledDateTime':
        if (value) {
          await sendOrScheduleEmail(emailData, value as Date);
        } else {
          await sendOrScheduleEmail(emailData);
        }
        return;
      default:
        break;
    }

    setMessages(prev => [...prev, { role: 'assistant', content: nextPrompt }]);
    setCurrentStep(nextStep);
  };

  const sendOrScheduleEmail = async (emailData: EmailData, scheduledDateTime?: Date) => {
    try {
      const tokens = JSON.parse(localStorage.getItem('gmail_tokens') || '{}')
      const userEmail = localStorage.getItem('user_email') || ''

      const campaignData: CampaignCreationData = {
        name: `Single Email - ${new Date().toISOString()}`,
        type: 'single',
        subject: emailData.subject,
        body: emailData.body,
        recipients: emailData.recipients,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isRecurring: false,
        targetAudience: 'specific',
        userEmail,
        tokens,
        isScheduled: !!scheduledDateTime,
        scheduledDateTime: scheduledDateTime?.toISOString(),
        isSingleEmail: true,
      };

      const newCampaign = await createCampaign(campaignData);

      console.log("New email campaign object:", newCampaign);

      setMessages(prev => [...prev, 
        { role: 'assistant', content: scheduledDateTime
          ? `Great! Your email has been scheduled for ${scheduledDateTime.toLocaleString()}. It will be sent to ${emailData.recipients.length} recipient(s). Is there anything else I can help you with?`
          : `Excellent! Your email has been sent to ${emailData.recipients.length} recipient(s). Is there anything else you'd like to do?`
        }
      ]);
      setCurrentStep(0);
      setCurrentAction(null);
      setIsFormVisible(false);
      setIsCreatingEmail(false);
    } catch (error) {
      console.error('Error sending/scheduling email:', error);
      setMessages(prev => [...prev, 
        { role: 'assistant', content: `I'm sorry, but there was an error sending/scheduling the email: ${error instanceof Error ? error.message : 'Unknown error'}. Can I help you troubleshoot or try again?` }
      ]);
    }
  };

  // Add this function inside the EnhancedEmailCampaignGenerator component

  const saveCampaign = async (scheduledDateTime?: Date) => {
    setAiStatus('Saving campaign...')
    try {
      const tokens = JSON.parse(localStorage.getItem('gmail_tokens') || '{}')
      const userEmail = localStorage.getItem('user_email') || ''

      // Create personalized campaigns for each recipient
      const personalizedCampaigns = campaignData.recipients.map(recipient => {
        const personalizedBody = campaignData.body.replace(/\[Name\]/g, recipient.name);
        
        return {
          ...campaignData,
          body: personalizedBody,
          recipients: [recipient], // Send to individual recipient
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          isRecurring: false,
          targetAudience: 'specific',
          userEmail,
          tokens,
          isScheduled: !!scheduledDateTime,
          scheduledDateTime: scheduledDateTime?.toISOString(),
        };
      });

      // Create all campaigns
      const results = await Promise.all(
        personalizedCampaigns.map(campaign => createCampaign(campaign))
      );

      setMessages(prev => [...prev, 
        { 
          role: 'assistant', 
          content: campaignData.isScheduled
            ? `Great! Your campaign has been scheduled for ${scheduledDateTime?.toLocaleString()}. It will be sent to ${campaignData.recipients.length} recipients with personalized content.`
            : `Excellent! Your campaign has been created and will be sent shortly to ${campaignData.recipients.length} recipients with personalized content.`
        }
      ]);

      setCurrentStep(0);
      setCurrentAction(null);
      setIsFormVisible(false);
      setIsCreatingCampaign(false);
      setAiStatus('');
    } catch (error) {
      console.error('Error saving campaign:', error);
      setMessages(prev => [...prev, 
        { 
          role: 'assistant', 
          content: `I'm sorry, but there was an error creating the campaign: ${error instanceof Error ? error.message : 'Unknown error'}. Can I help you troubleshoot or try again?` 
        }
      ]);
      setAiStatus('Error saving campaign. Please try again.');
    }
  };

  return (
    <div 
      className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => handleKeyboardShortcut(e, {
        'cmd+t': () => {
          if (!isCreatingCampaign && !isCreatingTemplate && !isCreatingEmail) {
            startCampaignCreation();
          }
        },
        'cmd+u': () => {
          if (!isCreatingCampaign && !isCreatingTemplate && !isCreatingEmail) {
            startTemplateCreation();
          }
        },
        'cmd+e': () => {
          if (!isCreatingCampaign && !isCreatingTemplate && !isCreatingEmail) {
            startEmailCreation();
          }
        },
        'cmd+k': () => {
          console.log('Command palette opened');
        },
        'cmd+m': () => {
          if (!isPaymentFormVisible) {
            setIsPaymentFormVisible(true);
            setMessages(prev => [...prev, 
              { role: 'user', content: "I want to send money" },
              { role: 'assistant', content: "Certainly! I've opened the payment form for you. Please fill in the details to send money." }
            ]);
          }
        },
        'esc': handleCancel,
      })}
    >
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          className="hidden lg:block"
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
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
            
            {/* Main content */}
            <div className="flex flex-1 space-x-6 overflow-hidden">
              {/* Chat area */}
              <div className={`flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg ${isFormVisible ? 'lg:w-2/3' : 'w-full'}`}>
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--scrollbar) var(--scrollbar-bg)' }}>
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

                  <form onSubmit={handleSubmit} className="mt-4 w-full">
                    <div className="relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                        className="pr-12 py-3 text-sm bg-background border-input focus:border-ring focus:ring-ring rounded-lg w-full"
                      />
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 transition-colors duration-200"
                      >
                        {isLoading ? <InfinityLoader /> : <Send className="h-5 w-5" />}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right panel */}
              {isFormVisible && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-full lg:w-1/3 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-y-auto"
                >
                  <RightPanel 
                    isCreatingCampaign={isCreatingCampaign}
                    isCreatingTemplate={isCreatingTemplate}
                    campaignData={campaignData}
                    templateData={templateData}
                    currentStep={currentStep}
                    handleInputSubmit={handleInputSubmit}
                    handleTemplateInput={handleTemplateInput}
                    handleCancel={handleCancel}
                    setCampaignData={setCampaignData}
                    setTemplateData={setTemplateData}
                    statusUpdate={statusUpdate}
                    setStatusUpdate={setStatusUpdate}
                    handleScheduleCampaign={handleScheduleCampaign}
                    handleCustomDateTimeSubmit={handleCustomDateTimeSubmit}
                    handleFileUpload={handleFileUpload}
                    isCreatingEmail={isCreatingEmail}
                    emailData={emailData}
                    setEmailData={setEmailData}
                    handleEmailInput={handleEmailInput}
                    setCurrentStep={setCurrentStep}
                    setInput={setInput}
                    generateEmailContent={generateEmailContent}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Payment form modal */}
      {isPaymentFormVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Send Payment</h2>
            <SendPaymentForm onSubmit={handlePaymentSubmit} />
            <Button onClick={() => setIsPaymentFormVisible(false)} className="mt-4">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Confirmation dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              {pendingPaymentData?.isMultipleRecipients
                ? `Are you sure you want to send payments to multiple recipients via ${pendingPaymentData.paymentType.toUpperCase()}?`
                : `Are you sure you want to send $${pendingPaymentData?.amount} to ${pendingPaymentData?.recipient} via ${pendingPaymentData?.paymentType.toUpperCase()}?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmationDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAndSendPayment}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
