"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signInWithCustomToken } from 'firebase/auth'
import { createOrUpdateUser } from '@/utils/db'
import DashboardSkeleton from '@/app/pages/dashboard-skeleton'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (!searchParams) {
          throw new Error('No search params available')
        }

        const tokensParam = searchParams.get('tokens')
        if (!tokensParam) {
          throw new Error('No tokens received')
        }

        // Parse the tokens parameter
        const authData = JSON.parse(decodeURIComponent(tokensParam))
        console.log('Received auth data:', authData)

        // Store Gmail tokens
        localStorage.setItem('gmail_tokens', JSON.stringify(authData.gmailTokens))
        
        // Sign in with custom token
        const userCredential = await signInWithCustomToken(auth, authData.firebaseToken)
        const firebaseUser = userCredential.user

        // Create or update user in Firestore
        await createOrUpdateUser({
          id: firebaseUser.uid,
          email: authData.userInfo.email,
          name: authData.userInfo.name,
          picture: authData.userInfo.picture,
          gmailTokens: authData.gmailTokens
        })

        console.log('Successfully authenticated with Firebase')
        
        // Redirect to dashboard
        router.push('/dashboard')
        
      } catch (error) {
        console.error('Error during authentication:', error)
        // Redirect to login page with error
        router.push(`/login?error=${encodeURIComponent((error as Error).message)}`)
      }
    }

    handleAuth()
  }, [router, searchParams])

  return <DashboardSkeleton />
}
