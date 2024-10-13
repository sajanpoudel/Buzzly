'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useViewportScroll, useTransform } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Send, Zap, ChevronDown, BarChart, Target, Sparkles } from 'lucide-react'

const RealisticHumanEmailAnimation = () => {
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="skinGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#FFD1B3" />
            <stop offset="100%" stopColor="#FFA07A" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Desk */}
        <rect x="20" y="200" width="360" height="10" fill="#8B4513" />

        {/* Human */}
        <g transform="translate(100, 180)">
          {/* Body */}
          <path d="M-20,0 C-20,10 -10,40 0,40 C10,40 20,10 20,0 Z" fill="#4169E1" />
          {/* Head */}
          <circle cx="0" cy="-50" r="20" fill="url(#skinGradient)" />
          {/* Hair */}
          <path d="M-20,-60 Q0,-80 20,-60 Q20,-75 0,-70 Q-20,-75 -20,-60" fill="#8B4513" />
          {/* Eyes */}
          <ellipse cx="-7" cy="-53" rx="3" ry="2" fill="#000" />
          <ellipse cx="7" cy="-53" rx="3" ry="2" fill="#000" />
          {/* Nose */}
          <path d="M0,-50 L2,-45 L-2,-45 Z" fill="#FFA07A" />
          {/* Mouth */}
          <path d="M-5,-40 Q0,-35 5,-40" stroke="#000" strokeWidth="1" fill="none" />
          {/* Arms */}
          <path d="M-20,0 Q-40,20 -30,40" stroke="#4169E1" strokeWidth="8" fill="none" />
          <path d="M20,0 Q40,10 50,30" stroke="#4169E1" strokeWidth="8" fill="none">
            <animate attributeName="d" values="M20,0 Q40,10 50,30; M20,0 Q50,0 60,20; M20,0 Q40,10 50,30" dur="2s" repeatCount="indefinite" />
          </path>
          {/* Hands */}
          <circle cx="-30" cy="40" r="6" fill="url(#skinGradient)" />
          <circle cx="50" cy="30" r="6" fill="url(#skinGradient)">
            <animate attributeName="cy" values="30;20;30" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Computer */}
        <rect x="50" y="150" width="80" height="50" fill="#C0C0C0" />
        <rect x="55" y="155" width="70" height="40" fill="#000080" />

        {/* Recipients */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${300 + i * 30}, ${50 + i * 70})`}>
            <circle cx="0" cy="0" r="15" fill="url(#skinGradient)" />
            <path d="M-10,-5 Q0,5 10,-5" stroke="#000" strokeWidth="1" fill="none" />
            <circle cx="-5" cy="-5" r="2" fill="#000" />
            <circle cx="5" cy="-5" r="2" fill="#000" />
            <path d="M-15,0 Q-20,20 0,25 Q20,20 15,0" fill="#4169E1" />
          </g>
        ))}

        {/* Flying Emails */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path d="M-10,-6 L10,-6 L10,6 L-10,6 Z M-10,-6 L0,0 L10,-6" fill="#FFFFFF" stroke="#000" strokeWidth="0.5" filter="url(#glow)">
              <animateMotion
                path={`M100,180 Q${200 + i * 30},${100 + i * 30} ${300 + i * 30},${50 + i * 70}`}
                dur={`${3 + i * 0.5}s`}
                begin={`${i * 1}s`}
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}

        {/* Network Lines */}
        <g stroke="#4169E1" strokeWidth="0.5" opacity="0.3">
          <line x1="100" y1="180" x2="300" y2="50" />
          <line x1="100" y1="180" x2="330" y2="120" />
          <line x1="100" y1="180" x2="360" y2="190" />
        </g>
      </svg>
    </div>
  )
}

const FloatingEmails = () => {
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

export default function LandingPage() {
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
          Revolutionize Your Email Campaigns with AI
        </motion.h1>
        <motion.p
          className="text-2xl mb-8 text-center max-w-2xl text-blue-300"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          Harness the power of artificial intelligence to create hyper-personalized, engaging email campaigns
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
        >
          <Button 
            className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 rounded-full shadow-lg transform transition-all duration-500 hover:scale-105" 
            onClick={() => alert('Get Started clicked!')}
          >
            Transform Your Emails
          </Button>
        </motion.div>
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

      <div className="relative z-10 w-full py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              className="bg-[#001F3F] p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-blue-400">AI-Driven Personalization</h2>
              <p className="text-gray-300 mb-4">Tailor your emails to each recipient with advanced AI algorithms</p>
              <Button className="bg-blue-500 hover:bg-blue-600">
                Explore <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              className="bg-[#001F3F] p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-green-400">Smart Content Generation</h2>
              <p className="text-gray-300 mb-4">Create compelling email content with AI-powered suggestions</p>
              <Button className="bg-green-500 hover:bg-green-600">
                Discover <Target className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              className="bg-[#001F3F] p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-purple-400">Predictive Analytics</h2>
              <p className="text-gray-300 mb-4">Optimize your campaigns with AI-driven insights and predictions</p>
              <Button className="bg-purple-500 hover:bg-purple-600">
                Analyze <BarChart className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

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
          <motion.form 
            className="max-w-md mx-auto"
            initial={{ opacity: 0, 
            y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex items-center bg-[#001F3F] rounded-full p-1 shadow-lg">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-none text-white placeholder-gray-500 focus:outline-none focus:ring-0 flex-grow"
              />
              <Button type="submit" size="icon" className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  )
}