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
import { handleKeyboardShortcut, SHORTCUTS } from '@/utils/keyboardShortcuts'
import { generateTemplate, saveTemplate } from '@/functionCalling/templateFunctions';
import { Switch } from "@/components/ui/switch"
import { CampaignCreationData } from '@/types/campaign';  // Adjust the import path as necessary
import { SendPaymentForm, PaymentData } from '@/components/SendPaymentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import Image from 'next/image'

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
  isSingleEmail?: boolean; // Add this line
}

interface TemplateData {
  name: string;
  description: string;
  subject: string;
  body: string;
}

interface EmailData {
  template: EmailTemplate | null;
  subject: string;
  body: string;
  recipients: { name: string; email: string }[];
  scheduledDateTime?: Date;
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
}) => {
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
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.CampaignNameInput 
                value={campaignData.name}
                onChange={(value) => setCampaignData(prev => ({ ...prev, name: value }))}
              />
              {renderButtons(() => handleInputSubmit('name'))}
            </div>
          );
        case 2:
          return (
            <div className="space-y-4 w-full">
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
            <div className="space-y-4 w-full">
              <PlaygroundUI.SubjectInput
                value={campaignData.subject}
                onChange={(value) => setCampaignData(prev => ({ ...prev, subject: value }))}
              />
              {renderButtons(() => handleInputSubmit('subject'))}
            </div>
          );
        case 4:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.BodyTextarea
                value={campaignData.body}
                onChange={(value) => setCampaignData(prev => ({ ...prev, body: value }))}
              />
              {renderButtons(() => handleInputSubmit('body'))}
            </div>
          );
        case 5:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.RecipientFileUpload
                onChange={(file) => {
                  handleFileUpload(file);
                }}
              />
            </div>
          );
        case 6:
          return (
            <div className="space-y-4 w-full">
              <Button onClick={() => handleScheduleCampaign('now')} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center">
                <InfinityLoader />
                <span className="ml-2">Send Now</span>
              </Button>
              <Button onClick={() => handleScheduleCampaign('tomorrow')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center">
                <InfinityLoader />
                <span className="ml-2">Tomorrow at 10:00 AM</span>
              </Button>
              <Button onClick={() => handleScheduleCampaign('in2days')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center">
                <InfinityLoader />
                <span className="ml-2">In 2 days at 10:00 AM</span>
              </Button>
              <Button onClick={() => handleScheduleCampaign('custom')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center">
                <InfinityLoader />
                <span className="ml-2">Custom Date & Time</span>
              </Button>
            </div>
          );
        case 7:
          return (
            <div className="space-y-4 w-full">
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
              <Button onClick={handleCustomDateTimeSubmit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200">Confirm Schedule</Button>
            </div>
          );
        default:
          return null;
      }
    } else if (isCreatingTemplate) {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4 w-full">
              <PlaygroundUI.TemplateDescriptionInput 
                value={templateData.description}
                onChange={(value) => setTemplateData(prev => ({ ...prev, description: value }))}
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
              />
              <PlaygroundUI.BodyTextarea
                value={templateData.body}
                onChange={(value) => setTemplateData(prev => ({ ...prev, body: value }))}
              />
              <PlaygroundUI.TemplateNameInput
                value={templateData.name}
                onChange={(value) => setTemplateData(prev => ({ ...prev, name: value }))}
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
      
      <AnimatePresence>
        {statusUpdate && (
          <StatusUpdate message={statusUpdate} />
        )}
      </AnimatePresence>

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
    template: null
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await handleUserInput(input)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      
      if (response.includes("Let's create a new campaign") && !isCreatingCampaign) {
        startCampaignCreation();
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
    let nextStep = currentStep + 1;

    switch (field) {
      case 'name':
        setStatusUpdate("Campaign name set. Selecting type...");
        break;
      case 'type':
        setStatusUpdate("Campaign type selected. Crafting subject...");
        break;
      case 'subject':
        setStatusUpdate("Subject created. Composing email body...");
        break;
      case 'body':
        setStatusUpdate("Email body composed. Preparing recipient list...");
        break;
      case 'recipients':
        setStatusUpdate("Recipient list uploaded. Finalizing campaign...");
        nextStep = 6;
        break;
      default:
        nextStep = currentStep;
    }

    setCurrentStep(nextStep);
  }

  const handleFileUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const lines = content.split('\n')
        const recipients = lines.slice(1).map(line => {  // Skip header row if present
          const [name, email] = line.split(',')
          return { name: name.trim(), email: email.trim() }
        }).filter(recipient => recipient.email)  // Filter out any empty entries

        setCampaignData(prev => ({ ...prev, recipients }))
        console.log("Recipients loaded:", recipients)  // Log for debugging

        setMessages(prev => [...prev, 
          { role: 'user', content: `Uploaded ${file.name}` },
          { role: 'assistant', content: `Great! I've processed your recipient list. ${recipients.length} recipients have been added to your campaign. Your campaign is now ready to go. Would you like to schedule it for later or send it right away?` }
        ])
        setCurrentStep(6)
      }
      reader.readAsText(file)
    } else {
      setMessages(prev => [...prev, 
        { role: 'user', content: 'No file uploaded' },
        { role: 'assistant', content: "I'm sorry, but no file was uploaded. Would you like to try uploading the recipient list again?" }
      ])
    }
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

      console.log("New campaign object:", newCampaign)  // Log for debugging

      setMessages(prev => [...prev, 
        { role: 'assistant', content: scheduledDateTime
          ? `Great! Your campaign "${newCampaign.name}" has been scheduled for ${scheduledDateTime.toLocaleString()}. It will be sent to ${campaignData.recipients.length} recipients. Is there anything else I can help you with?`
          : `Excellent! Your campaign "${newCampaign.name}" has been created and will be sent shortly to ${campaignData.recipients.length} recipients. Is there anything else you'd like to do?`
        }
      ])
      setCurrentStep(0)
      setCurrentAction(null)
      setIsFormVisible(false)
      setIsCreatingCampaign(false)
    } catch (error) {
      console.error('Error saving campaign:', error)
      setMessages(prev => [...prev, 
        { role: 'assistant', content: `I'm sorry, but there was an error creating the campaign: ${error instanceof Error ? error.message : 'Unknown error'}. Can I help you troubleshoot or try again?` }
      ]);
    }
  }

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

  const handleTemplateInput = async (field: keyof TemplateData) => {
    const value = templateData[field];
    let nextStep = currentStep + 1;

    switch (field) {
      case 'description':
        if (value.length > 5) {
          try {
            setStatusUpdate("Generating template based on description...");
            const generatedTemplate = await generateTemplate(value);
            
            // Clean up the subject by removing "Subject:" prefix and any asterisks
            const cleanSubject = generatedTemplate.subject
              .replace(/^Subject:\s*/i, '')
              .replace(/\*\*/g, '')
              .replace(/<[^>]*>/g, '')
              .trim();

            // Clean up the body by removing "Body:" prefix and any asterisks
            const cleanBody = generatedTemplate.body
              .replace(/^\*\*Body\*\*:\s*/i, '')
              .replace(/\*\*/g, '')
              .trim();

            setTemplateData(prev => ({
              ...prev,
              subject: cleanSubject,
              body: cleanBody,
            }));
            setStatusUpdate("Template generated. Please review and make any necessary changes.");
            nextStep = 2; // Move to the next step to show the generated template
          } catch (error) {
            console.error('Error generating template:', error);
            setStatusUpdate("Error generating template. Please try again or enter details manually.");
            nextStep = currentStep; // Stay on the same step
          }
        } else {
          setStatusUpdate("Please provide a more detailed description (more than 5 characters) to generate a template.");
          nextStep = currentStep; // Stay on the same step
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
          nextStep = currentStep; // Stay on the same step
        }
        break;
      default:
        break;
    }

    setCurrentStep(nextStep);
  };

  const handleEmailInput = async (field: keyof EmailData) => {
    const value = emailData[field];
    let nextStep = currentStep + 1;

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
        break;
      case 'body':
        setStatusUpdate("Email body set. Now, let's add recipients.");
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

  const handlePaymentSubmit = (paymentData: PaymentData) => {
    setPendingPaymentData(paymentData);
    setIsConfirmationDialogOpen(true);
  };

  const confirmAndSendPayment = async () => {
    if (!pendingPaymentData) return;

    try {
      const response = await fetch('/api/send-digital-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingPaymentData),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const result = await response.json();
      console.log('Payment result:', result);

      setMessages(prev => [...prev, 
        { role: 'assistant', content: `${pendingPaymentData.paymentType.toUpperCase()} payment of $${pendingPaymentData.amount} sent successfully to ${pendingPaymentData.recipient}. Transaction ID: ${result.result.id}` }
      ]);

      setIsPaymentFormVisible(false);
      setIsConfirmationDialogOpen(false);
    } catch (error) {
      console.error('Error sending payment:', error);
      setMessages(prev => [...prev, 
        { role: 'assistant', content: `I'm sorry, but there was an error sending the ${pendingPaymentData.paymentType.toUpperCase()} payment: ${error instanceof Error ? error.message : 'Unknown error'}. Can I help you troubleshoot or try again?` }
      ]);
      setIsConfirmationDialogOpen(false);
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

                  {/* Always show the chat input, but disable it when forms are visible */}
                  <form onSubmit={handleSubmit} className="mt-4 w-full">
                    <div className="relative">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isFormVisible ? "Please complete the form on the right..." : "Ask me anything about email campaigns..."}
                        className="pr-12 py-3 text-sm min-h-[100px] resize-none bg-background border-input focus:border-ring focus:ring-ring rounded-lg w-full"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && !isFormVisible) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                        disabled={isFormVisible}
                      />
                      <Button 
                        type="submit" 
                        disabled={isLoading || isFormVisible}
                        className="absolute right-2 bottom-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 transition-colors duration-200"
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
              Are you sure you want to send ${pendingPaymentData?.amount} to {pendingPaymentData?.recipient} via {pendingPaymentData?.paymentType.toUpperCase()}?
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