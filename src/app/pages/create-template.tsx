"use client"

import React, { useState, useEffect } from 'react'
import { Search, Moon, Bell, MoreVertical, Menu, Sun, Loader } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { getInitialsFromEmail } from '@/utils/stringUtils';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function CreateTemplate() {
  const [darkMode, setDarkMode] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateFee, setTemplateFee] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generateTemplate = async () => {
    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Generate an email template with the following details:
        Template Name: ${templateName}
        Category: ${templateCategory}
        Description: ${templateDescription}
        
        Please provide a subject line and email body. Use [NAME] as a placeholder for the recipient's name. Do not include "Subject:" or any asterisks in the response. Separate the subject and body with two newline characters.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      console.log('Generated Text:', generatedText);

      const [generatedSubject, ...bodyParts] = generatedText.split('\n\n');
      setSubject(generatedSubject.trim());
      setBody(bodyParts.join('\n\n').trim());
    } catch (error) {
      console.error('Error generating template:', error);
      // You might want to set an error state here to display to the user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = () => {
    // Implement save template logic here
    console.log('Template saved:', { templateName, templateFee, templateCategory, templateDescription, subject, body })
  }

  return (
    <div className={`flex flex-col h-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold dark:text-white">Create Template</h1>
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Template</h1>
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
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
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
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="templateFee">Template Fee</Label>
                      <Input
                        id="templateFee"
                        placeholder="Enter fee (e.g., $10.00)"
                        value={templateFee}
                        onChange={(e) => setTemplateFee(e.target.value)}
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="templateCategory">Category</Label>
                      <Select value={templateCategory} onValueChange={setTemplateCategory}>
                        <SelectTrigger id="templateCategory" className="bg-white dark:bg-gray-800">
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
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                
                  <Button 
                    onClick={generateTemplate} 
                    disabled={isGenerating || !templateName || !templateCategory || !templateDescription}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Generate Template
                  </Button>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Email subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-white dark:bg-gray-800"
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
                      className="min-h-[200px] bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button variant="outline" className="w-full sm:w-auto">
                        EDIT
                      </Button>
                      <Button variant="outline" className="w-full sm:w-auto">
                        TRY ANOTHER TEMPLATE
                      </Button>
                    </div>
                    <Button onClick={handleSaveTemplate} className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                      SAVE TEMPLATE
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

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