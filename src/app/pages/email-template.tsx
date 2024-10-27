"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createTemplate, getTemplates } from '@/utils/db'
import { TemplateData } from '@/types/database'
import { Search, Grid, Moon, Bell, MoreVertical, ChevronDown, ArrowUpRight, Menu, Sun } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { getInitialsFromEmail } from '@/utils/stringUtils';

export default function EmailTemplateDashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; picture: string } | null>(null)
  const { user } = useAuth()
  const [templates, setTemplates] = useState<TemplateData[]>([])
  
  // Template form states
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    const loadTemplates = async () => {
      if (!user) return
      try {
        const userTemplates = await getTemplates(user.id)
        setTemplates(userTemplates)
      } catch (error) {
        console.error('Error loading templates:', error)
      }
    }

    loadTemplates()
  }, [user])

  const handleSaveTemplate = async () => {
    if (!user) return

    try {
      const templateData: TemplateData = {
        id: Date.now().toString(), // Generate an ID
        userId: user.id,
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        subject: subject,
        body: body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await createTemplate(templateData)
      // Refresh templates
      const updatedTemplates = await getTemplates(user.id)
      setTemplates(updatedTemplates)

      // Reset form
      setTemplateName('')
      setTemplateDescription('')
      setTemplateCategory('')
      setSubject('')
      setBody('')

    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold dark:text-white">Email Templates</h1>
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
        
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-96 mb-4 lg:mb-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input type="search" placeholder="Search templates" className="pl-10 pr-4 py-2 w-full" />
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="hidden lg:inline-flex">
                  <Grid className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleDarkMode}>
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="hidden lg:inline-flex">
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

            {/* Template Form */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Create New Template</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Template Name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                  <Input
                    placeholder="Category"
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                  />
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Description"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="Email Body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full h-40 p-2 border rounded-md"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button onClick={handleSaveTemplate}>Save Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Your Templates</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>{template.name}</TableCell>
                          <TableCell>{template.category}</TableCell>
                          <TableCell>{template.description}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
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
