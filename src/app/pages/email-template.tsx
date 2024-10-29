"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Moon, Bell, Plus, Edit2, Trash2, Sun, Menu, Filter, ArrowUpDown, Grid, List, X, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { getTemplates, deleteTemplate, updateTemplate } from '@/utils/db'
import { TemplateData } from '@/types/database'
import { getInitialsFromEmail } from '@/utils/stringUtils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Label } from '@/components/ui/label'

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['link', 'image'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ align: [] }],
    ['clean'],
  ],
}

export default function EmailTemplates() {
  const router = useRouter()
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; picture: string } | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date')
  const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        const userTemplates = await getTemplates(user.id)
        setTemplates(userTemplates)
      } catch (error) {
        console.error('Error loading templates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplates()
  }, [user])

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
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, []);

  const handleEdit = (template: TemplateData) => {
    setEditingTemplate(template);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;
    
    try {
      setIsLoading(true);
      await updateTemplate(editingTemplate.id, editingTemplate);
      
      // Refresh templates list
      const updatedTemplates = await getTemplates(user!.id);
      setTemplates(updatedTemplates);
      
      // Reset editing state
      setEditingTemplate(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setIsEditing(false);
  };

  const handleDelete = async (templateId: string) => {
    try {
      setIsLoading(true)
      await deleteTemplate(templateId)
      
      // Refresh templates list after deletion
      const updatedTemplates = await getTemplates(user!.id)
      setTemplates(updatedTemplates)
      
      setIsDeleteDialogOpen(false)
      setTemplateToDelete(null)
    } catch (error) {
      console.error('Error deleting template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const filteredTemplates = templates
    .filter(template => 
      (template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory === 'all' || template.category === selectedCategory)
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return a.name.localeCompare(b.name)
    })

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

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
        
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Header - removed border and made it absolute */}
          <header className="absolute top-0 left-0 right-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 gap-4">
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                  </Button>
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      className="pl-10 w-full bg-gray-50 dark:bg-gray-800 border-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {categories.map(category => (
                          <DropdownMenuItem
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSortBy('name')}>
                          Name
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('date')}>
                          Date
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
            </div>
          </header>

          {/* Main content - added pt-20 to account for fixed header */}
          <div className="flex-1 overflow-auto pt-20">
            <div className="max-w-7xl mx-auto p-4 lg:p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold dark:text-white">Email Templates</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Browse and manage your email templates
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/create-template')} 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>

              <Tabs defaultValue="all" className="mb-8">
                <TabsList>
                  {categories.map(category => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {isEditing && editingTemplate ? (
                <Card className="mb-8">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Edit Template</CardTitle>
                      <Button variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                          id="name"
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate(prev => 
                            prev ? { ...prev, name: e.target.value } : null
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={editingTemplate.description}
                          onChange={(e) => setEditingTemplate(prev => 
                            prev ? { ...prev, description: e.target.value } : null
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={editingTemplate.subject}
                          onChange={(e) => setEditingTemplate(prev => 
                            prev ? { ...prev, subject: e.target.value } : null
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="body">Email Body</Label>
                        <div className="min-h-[400px] border rounded-md">
                          <ReactQuill
                            value={editingTemplate.body}
                            onChange={(value) => setEditingTemplate(prev => 
                              prev ? { ...prev, body: value } : null
                            )}
                            modules={modules}
                            theme="snow"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveEdit}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <Card key={n} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className={viewMode === 'grid' ? 
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
                  "space-y-4"
                }>
                  {filteredTemplates.map(template => (
                    <Card 
                      key={template.id} 
                      className={`group hover:shadow-lg transition-shadow duration-200 ${
                        viewMode === 'list' ? 'flex items-center' : ''
                      }`}
                    >
                      <div className={viewMode === 'list' ? 'flex-1 p-4' : ''}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg font-semibold">
                                {template.name}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {template.description}
                              </CardDescription>
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(template)}
                                className="hover:bg-purple-100 dark:hover:bg-purple-900"
                              >
                                <Edit2 className="h-4 w-4 text-purple-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setTemplateToDelete(template.id)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="hover:bg-red-100 dark:hover:bg-red-900"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="secondary"
                              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                            >
                              {template.category}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(template.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center mx-auto">
                      <Plus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">No templates found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchQuery ? 'No templates match your search criteria.' : 'Create your first email template to get started.'}
                  </p>
                  <Button 
                    onClick={() => router.push('/create-template')}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Create Template
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => templateToDelete && handleDelete(templateToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
