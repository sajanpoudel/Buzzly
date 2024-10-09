"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  console.log('redirect');

  useEffect(() => {
<<<<<<< Updated upstream
    const tokens = searchParams.get('tokens')
    console.log('Tokens:', tokens)
    if (tokens) {
      localStorage.setItem('gmail_tokens', tokens)
=======
    const paramTokens= searchParams.get('tokens')
    if (!paramTokens) {
      console.error('No tokens received')
      router.push('/')
      return
    }
    const tokens = JSON.parse(paramTokens)
  
  
    const storeUserInfo = async () => {

      try {
          const response = await axios.post('https://emailapp-backend.onrender.com/auth/user-info', {
              tokens,
          }, {
              headers: {
                  'Content-Type': 'application/json',
              },
          });
          const data = response.data;
    
          const store = await axios.post('/api/store-user',{
            email: data.email,
            name: data.name,
            profilePic: data.picture
          })


          console.log("Response from [Store-user]", store.data);
          } catch (error:any) {
              console.error("Error storing user info:", error.response ? error.response.data : error.message);
          }
      };
  
    
    if (paramTokens) {
      storeUserInfo()
      localStorage.setItem('gmail_tokens', paramTokens)
>>>>>>> Stashed changes
      console.log('Redirecting to /dashboard')
      router.push('/dashboard')
    } else {
      console.error('No tokens received')
      router.push('/')
    }
  }, [router, searchParams])

  return <div>Processing authentication...</div>
}