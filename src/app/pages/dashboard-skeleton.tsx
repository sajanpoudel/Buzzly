import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from "@/components/ui/card"
import { LayoutDashboard, MessageSquare, CreditCard, FileText, Users, Mail, Settings, MoreVertical } from 'lucide-react'

export default function DashboardSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 p-6 flex flex-col overflow-y-auto">
          <div className="flex items-center space-x-2 mb-8">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-10 w-full mb-6" />
            <nav className="space-y-1">
              {[LayoutDashboard, MessageSquare, CreditCard, FileText, Users, CreditCard, FileText, Mail, Settings].map((Icon, index) => (
                <div key={index} className="flex items-center space-x-2 py-2">
                  <Icon className="h-4 w-4 text-gray-400" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </nav>
          </div>
          <div className="flex items-center mt-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-3 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full ml-auto" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto bg-gray-100 dark:bg-gray-900">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-[300px] w-full mb-4" />
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-3 rounded-full mr-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-3 rounded-full mr-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
