"use client"
import { Button } from '@/components/ui/button'
import axios from 'axios'

import React from 'react'

type Props = {}

const page = (props: Props) => {
    
    const handleApi = async () => {
        try {
            const storedTokens = localStorage.getItem('gmail_tokens');
            if (!storedTokens) {
                console.error('No tokens found');
                return;
            }
            const tokens = JSON.parse(storedTokens);

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
           console.log("This is the response", store.data);
            console.log("This is the data back", response.data);
            } catch (error:any) {
                console.error("Error storing user info:", error.response ? error.response.data : error.message);
        }
    }
  return (
    <div className='text-center my-auto'>
        <Button onClick={handleApi} >
            Hello
        </Button>
            
    </div>
  )
}

export default page