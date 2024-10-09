"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  console.log('Login');

  const handleGoogleLogin = async () => {
    try {
      const token = localStorage.getItem('gmail_tokens');
      console.log('Token at login :', token);
      if(token){
        router.push('/dashboard');
      }
      // Redirect to your backend's Google OAuth URL
      window.location.href = 'https://emailapp-backend.onrender.com/auth/google'
    } catch (error) {
      console.error('Error during Google login:', error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login to Email App</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleLogin} className="w-full">
            Login with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}