"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useAnimation, useViewportScroll, useTransform } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Mail, Send, Zap, ChevronDown, BarChart, Target, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const RealisticHumanEmailAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
        {/* SVG content goes here */}
      </svg>
    </div>
  )
}

const FloatingEmails: React.FC = () => {
  const emails = [
    { id: 1, x: -5, y: 2, delay: 0 },
    { id: 2, x: 5, y: -2, delay: 0.5 },
    { id: 3, x: -3, y: -3, delay: 1 },
    { id: 4, x: 3, y: 3, delay: 1.5 },
  ]

  return (
    <>
      {emails.map((email) => (
        <motion.div
          key={email.id}
          className="absolute"
          initial={{ x: email.x * 100, y: email.y * 100, opacity: 0 }}
          animate={{
            x: [email.x * 100, 0],
            y: [email.y * 100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4,
            delay: email.delay,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          <Mail className="text-blue-400 w-8 h-8" />
        </motion.div>
      ))}
    </>
  )
}

export default function Login() {
  const { signInWithGoogle } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const parallaxRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const { scrollYProgress } = useViewportScroll()
  const yPosAnim = useTransform(scrollYProgress, [0, 1], [0, -500])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (parallaxRef.current) {
      const { width, height } = parallaxRef.current.getBoundingClientRect()
      const offsetX = (mousePosition.x - width / 2) / width
      const offsetY = (mousePosition.y - height / 2) / height
      controls.start({
        x: offsetX * 20,
        y: offsetY * 20,
        transition: { type: 'spring', stiffness: 100, damping: 30 },
      })
    }
  }, [mousePosition, controls])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // First, redirect to backend for Gmail authentication
      window.location.href = 'https://superemailapp-backend.onrender.com/auth/google'
      
      // The backend will handle the redirect to auth-callback
      // with the tokens after successful authentication
      
    } catch (error) {
      console.error('Error during Google login:', error)
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show error if there is one
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#000814] text-white">
      <motion.div
        ref={parallaxRef}
        animate={controls}
        style={{ y: yPosAnim }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[800px] h-[600px]">
          <RealisticHumanEmailAnimation />
        </div>
      </motion.div>

      <FloatingEmails />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <motion.h1
          className="text-6xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Welcome to Buzzly
        </motion.h1>
        <motion.p
          className="text-2xl mb-8 text-center max-w-2xl text-blue-300"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          Revolutionize your email campaigns with AI
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
        >
          <Button 
            className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 rounded-full shadow-lg transform transition-all duration-500 hover:scale-105 flex items-center space-x-2" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <Mail className="w-6 h-6" />
                <span>Sign in with Gmail</span>
              </>
            )}
          </Button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-4 bg-red-500 text-white rounded-md"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          <ChevronDown className="w-8 h-8 text-blue-400" />
        </motion.div>
      </div>

      <motion.div
        className="absolute top-5 left-5"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full px-4 py-2 shadow-lg">
          <Zap className="text-yellow-300" />
          <span className="text-sm font-medium">AI-Powered</span>
        </div>
      </motion.div>

      <div className="relative z-10 w-full py-20 bg-gradient-to-t from-[#000814] to-transparent">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold mb-8 text-center text-blue-400"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Join the AI Email Revolution
          </motion.h2>
          <motion.div 
            className="max-w-md mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-gray-300 mb-4">Powered by advanced AI technology</p>
            <p className="text-sm opacity-70">© 2023 Buzzly. All rights reserved.</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

