import React, { useState } from 'react';
import { handlePlaygroundQuery } from '../functions/playgroundFunctions';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignType } from '@/types/database';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { createCampaign } from '@/utils/db';
import { createTemplate } from '@/utils/db';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  component?: React.ReactNode;
}

interface RightPanelState {
  isVisible: boolean;
  type: 'campaign' | 'template' | 'email' | null;
  data: any;
}

export const PlaygroundChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm your AI assistant for email campaigns. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [rightPanel, setRightPanel] = useState<RightPanelState>({
    isVisible: false,
    type: null,
    data: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage 
    }]);

    setIsLoading(true);

    try {
      const response = await handlePlaygroundQuery(userMessage, user.id);
      
      // Show appropriate form based on response
      if (response.text.includes("create a new campaign")) {
        setRightPanel({
          isVisible: true,
          type: 'campaign',
          data: { name: '', type: 'general', subject: '', body: '' }
        });
      } else if (response.text.includes("create a new template")) {
        setRightPanel({
          isVisible: true,
          type: 'template',
          data: { name: '', description: '', subject: '', body: '' }
        });
      } else if (response.text.includes("send an email")) {
        setRightPanel({
          isVisible: true,
          type: 'email',
          data: { subject: '', body: '', recipients: [] }
        });
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant',
        content: response.text,
        component: response.component
      }]);
    } catch (error) {
      console.error('Error handling query:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const campaignData = {
        ...rightPanel.data,
        userId: user.id,
        userEmail: user.email || '',
        recipients: [],
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isRecurring: false,
        isScheduled: false,
        targetAudience: 'all'
      };

      await createCampaign(campaignData);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Great! I've created a campaign named "${rightPanel.data.name}". Would you like to add recipients now?`
      }]);
      
      setRightPanel({ isVisible: false, type: null, data: {} });
    } catch (error) {
      console.error('Error creating campaign:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error creating the campaign.'
      }]);
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const templateData = {
        ...rightPanel.data,
        userId: user.id
      };

      await createTemplate(templateData);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Template "${rightPanel.data.name}" has been created successfully!`
      }]);
      
      setRightPanel({ isVisible: false, type: null, data: {} });
    } catch (error) {
      console.error('Error creating template:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error creating the template.'
      }]);
    }
  };

  const renderRightPanel = () => {
    if (!rightPanel.isVisible) return null;

    switch (rightPanel.type) {
      case 'campaign':
        return (
          <div className="w-96 border-l p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Campaign</h2>
            <form onSubmit={handleCampaignSubmit} className="space-y-4">
              <div>
                <Label>Campaign Name</Label>
                <Input
                  value={rightPanel.data.name}
                  onChange={(e) => setRightPanel(prev => ({
                    ...prev,
                    data: { ...prev.data, name: e.target.value }
                  }))}
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <Label>Campaign Type</Label>
                <Select
                  value={rightPanel.data.type}
                  onValueChange={(value: CampaignType) => setRightPanel(prev => ({
                    ...prev,
                    data: { ...prev.data, type: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={rightPanel.data.subject}
                  onChange={(e) => setRightPanel(prev => ({
                    ...prev,
                    data: { ...prev.data, subject: e.target.value }
                  }))}
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <Label>Content</Label>
                <ReactQuill
                  value={rightPanel.data.body}
                  onChange={(content) => setRightPanel(prev => ({
                    ...prev,
                    data: { ...prev.data, body: content }
                  }))}
                  className="h-64 mb-12"
                />
              </div>
              <Button type="submit" className="w-full">
                Create Campaign
              </Button>
            </form>
          </div>
        );

      // Add other cases for template and email forms
      // ... similar structure for template and email forms

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
                <p>{message.content}</p>
                {message.component && (
                  <div className="mt-4">
                    {message.component}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg p-3">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your campaigns..."
            className="w-full p-2 border rounded-lg"
            disabled={isLoading}
          />
        </form>
      </div>

      {renderRightPanel()}
    </div>
  );
}; 